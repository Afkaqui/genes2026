import { Router, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.full_name as creator_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.created_by
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar cursos:', err);
    res.status(500).json({ message: 'Error al obtener cursos' });
  }
});

router.post('/', requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, hours, instructor } = req.body;

  if (!name || !hours) {
    res.status(400).json({ message: 'Nombre y horas son requeridos' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO courses (name, description, hours, instructor, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, hours, instructor || null, req.user!.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear curso:', err);
    res.status(500).json({ message: 'Error al crear curso' });
  }
});

router.put('/:id', requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, hours, instructor, active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE courses SET name = COALESCE($1, name), description = COALESCE($2, description),
       hours = COALESCE($3, hours), instructor = COALESCE($4, instructor), active = COALESCE($5, active)
       WHERE id = $6 RETURNING *`,
      [name, description, hours, instructor, active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Curso no encontrado' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar curso:', err);
    res.status(500).json({ message: 'Error al actualizar curso' });
  }
});

router.delete('/:id', requireRole('superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Curso no encontrado' });
      return;
    }
    res.json({ message: 'Curso eliminado' });
  } catch (err) {
    console.error('Error al eliminar curso:', err);
    res.status(500).json({ message: 'Error al eliminar curso' });
  }
});

export default router;
