import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { generateVerificationCode } from '../services/verification';
import { generateCertificatePDF } from '../services/pdf';

const router = Router();

// Public: verify certificate by code
router.get('/verify/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.type, c.verification_code, c.issue_date, c.hours,
              u.full_name, u.dni,
              co.name as course_name, co.instructor
       FROM certificates c
       JOIN users u ON u.id = c.user_id
       JOIN courses co ON co.id = c.course_id
       WHERE c.verification_code = $1`,
      [req.params.code]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ valid: false, message: 'Certificado no encontrado' });
      return;
    }

    const cert = result.rows[0];
    res.json({
      valid: true,
      type: cert.type,
      full_name: cert.full_name,
      dni: cert.dni,
      course_name: cert.course_name,
      hours: cert.hours,
      issue_date: cert.issue_date,
      instructor: cert.instructor,
      verification_code: cert.verification_code,
    });
  } catch (err) {
    console.error('Error al verificar certificado:', err);
    res.status(500).json({ valid: false, message: 'Error al verificar' });
  }
});

// Protected routes
router.use(authMiddleware);

// List certificates (users: own only; admin/superadmin: all)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'admin' || req.user!.role === 'superadmin';
    const query = isAdmin
      ? `SELECT c.*, u.full_name, u.dni, co.name as course_name, co.instructor
         FROM certificates c
         JOIN users u ON u.id = c.user_id
         JOIN courses co ON co.id = c.course_id
         ORDER BY c.created_at DESC`
      : `SELECT c.*, u.full_name, u.dni, co.name as course_name, co.instructor
         FROM certificates c
         JOIN users u ON u.id = c.user_id
         JOIN courses co ON co.id = c.course_id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`;

    const result = isAdmin
      ? await pool.query(query)
      : await pool.query(query, [req.user!.userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar certificados:', err);
    res.status(500).json({ message: 'Error al obtener certificados' });
  }
});

// Issue certificate (admin/superadmin)
router.post('/', requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { user_id, course_id, type, issue_date } = req.body;

  if (!user_id || !course_id) {
    res.status(400).json({ message: 'user_id y course_id son requeridos' });
    return;
  }

  try {
    const course = await pool.query('SELECT hours FROM courses WHERE id = $1', [course_id]);
    if (course.rows.length === 0) {
      res.status(404).json({ message: 'Curso no encontrado' });
      return;
    }

    let code: string;
    let attempts = 0;
    do {
      code = generateVerificationCode();
      const exists = await pool.query('SELECT 1 FROM certificates WHERE verification_code = $1', [code]);
      if (exists.rows.length === 0) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      res.status(500).json({ message: 'Error al generar codigo unico' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO certificates (user_id, course_id, type, verification_code, issue_date, hours, issued_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user_id,
        course_id,
        type || 'certificado',
        code!,
        issue_date || new Date().toISOString().split('T')[0],
        course.rows[0].hours,
        req.user!.userId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error al emitir certificado:', err);
    res.status(500).json({ message: 'Error al emitir certificado' });
  }
});

// Bulk issue (admin/superadmin)
router.post('/bulk', requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { user_ids, course_id, type, issue_date } = req.body;

  if (!Array.isArray(user_ids) || user_ids.length === 0 || !course_id) {
    res.status(400).json({ message: 'user_ids (array) y course_id son requeridos' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const course = await client.query('SELECT hours FROM courses WHERE id = $1', [course_id]);
    if (course.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Curso no encontrado' });
      return;
    }

    const issued = [];
    for (const uid of user_ids) {
      const existing = await client.query(
        'SELECT 1 FROM certificates WHERE user_id = $1 AND course_id = $2',
        [uid, course_id]
      );
      if (existing.rows.length > 0) continue;

      let code: string;
      let attempts = 0;
      do {
        code = generateVerificationCode();
        const exists = await client.query('SELECT 1 FROM certificates WHERE verification_code = $1', [code]);
        if (exists.rows.length === 0) break;
        attempts++;
      } while (attempts < 10);

      const result = await client.query(
        `INSERT INTO certificates (user_id, course_id, type, verification_code, issue_date, hours, issued_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [uid, course_id, type || 'certificado', code!, issue_date || new Date().toISOString().split('T')[0], course.rows[0].hours, req.user!.userId]
      );
      issued.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ issued: issued.length, certificates: issued });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en emision masiva:', err);
    res.status(500).json({ message: 'Error en emision masiva' });
  } finally {
    client.release();
  }
});

// Download PDF
router.get('/:id/pdf', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'admin' || req.user!.role === 'superadmin';
    const query = isAdmin
      ? `SELECT c.*, u.full_name, co.name as course_name, co.instructor
         FROM certificates c JOIN users u ON u.id = c.user_id JOIN courses co ON co.id = c.course_id
         WHERE c.id = $1`
      : `SELECT c.*, u.full_name, co.name as course_name, co.instructor
         FROM certificates c JOIN users u ON u.id = c.user_id JOIN courses co ON co.id = c.course_id
         WHERE c.id = $1 AND c.user_id = $2`;

    const params = isAdmin ? [req.params.id] : [req.params.id, req.user!.userId];
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Certificado no encontrado' });
      return;
    }

    const cert = result.rows[0];
    const doc = generateCertificatePDF({
      type: cert.type,
      fullName: cert.full_name,
      courseName: cert.course_name,
      hours: cert.hours,
      issueDate: cert.issue_date,
      verificationCode: cert.verification_code,
      instructor: cert.instructor,
    });

    const filename = `${cert.type}_${cert.verification_code}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Error al generar PDF:', err);
    res.status(500).json({ message: 'Error al generar PDF' });
  }
});

// Delete certificate (superadmin)
router.delete('/:id', requireRole('superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Certificado no encontrado' });
      return;
    }
    res.json({ message: 'Certificado eliminado' });
  } catch (err) {
    console.error('Error al eliminar certificado:', err);
    res.status(500).json({ message: 'Error al eliminar certificado' });
  }
});

export default router;
