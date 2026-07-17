import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole('admin', 'superadmin'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, username, full_name, dni, email, role, active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

router.post('/', requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, password, full_name, dni, email, role } = req.body;

  if (!username || !password || !full_name) {
    res.status(400).json({ message: 'Username, password y nombre completo son requeridos' });
    return;
  }

  const assignedRole = role || 'user';
  if (assignedRole === 'superadmin' && req.user!.role !== 'superadmin') {
    res.status(403).json({ message: 'Solo un superadmin puede crear superadmins' });
    return;
  }
  if (assignedRole === 'admin' && req.user!.role !== 'superadmin') {
    res.status(403).json({ message: 'Solo un superadmin puede crear admins' });
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, dni, email, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, full_name, dni, email, role, active, created_at`,
      [username, hash, full_name, dni || null, email || null, assignedRole]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ message: 'El username ya existe' });
      return;
    }
    console.error('Error al crear usuario:', err);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

router.put('/:id', requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { full_name, dni, email, role, active, password } = req.body;
  const isSuperadmin = req.user!.role === 'superadmin';
  const isSelf = parseInt(id) === req.user!.userId;

  try {
    const target = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    const targetRole = target.rows[0].role;

    // Los administradores solo pueden gestionar usuarios regulares (o editar su propia info)
    if (!isSuperadmin && !isSelf && targetRole !== 'user') {
      res.status(403).json({ message: 'Los administradores solo pueden gestionar usuarios regulares' });
      return;
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (full_name !== undefined) { fields.push(`full_name = $${idx++}`); values.push(full_name); }
    if (dni !== undefined) { fields.push(`dni = $${idx++}`); values.push(dni); }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }

    if (role !== undefined) {
      if (!isSuperadmin) { res.status(403).json({ message: 'Solo superadmins pueden cambiar roles' }); return; }
      fields.push(`role = $${idx++}`); values.push(role);
    }
    if (active !== undefined) {
      if (!isSuperadmin && isSelf) { res.status(403).json({ message: 'No puedes cambiar tu propio estado' }); return; }
      fields.push(`active = $${idx++}`); values.push(active);
    }
    if (password) {
      if (!isSuperadmin) { res.status(403).json({ message: 'Solo superadmins pueden cambiar contrasenas de otros usuarios' }); return; }
      const hash = await bcrypt.hash(password, 12);
      fields.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (fields.length === 0) {
      res.status(400).json({ message: 'Nada que actualizar' });
      return;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, username, full_name, dni, email, role, active`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const isSuperadmin = req.user!.role === 'superadmin';

  if (parseInt(id) === req.user!.userId) {
    res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    return;
  }

  try {
    const target = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (target.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Solo un superadmin puede eliminar administradores u otros superadmins
    if (!isSuperadmin && target.rows[0].role !== 'user') {
      res.status(403).json({ message: 'Solo un superadmin puede eliminar administradores' });
      return;
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

export default router;
