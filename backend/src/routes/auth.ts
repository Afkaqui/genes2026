import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Usuario y contrasena son requeridos' });
    return;
  }

  try {
    // Tolerante a espacios y mayusculas: un usuario cargado como "akaqui " no
    // debe quedar inaccesible porque la persona teclea "akaqui". La contrasena
    // se sigue comparando de forma exacta.
    const result = await pool.query(
      `SELECT id, username, password_hash, full_name, role, active
         FROM users
        WHERE lower(btrim(username)) = lower(btrim($1))
        LIMIT 1`,
      [username]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const user = result.rows[0];

    if (!user.active) {
      res.status(403).json({ message: 'Cuenta desactivada. Contacte al administrador.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    // Registra el primer ingreso a la plataforma (para saber quien ya accedio).
    await pool.query(
      `UPDATE users
         SET has_logged_in = true,
             first_login_at = COALESCE(first_login_at, CURRENT_TIMESTAMP)
       WHERE id = $1`,
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.put('/change-password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: 'Contrasena actual y nueva son requeridas' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ message: 'La nueva contrasena debe tener al menos 6 caracteres' });
    return;
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user!.userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Contrasena actual incorrecta' });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hash, req.user!.userId]);

    res.json({ message: 'Contrasena actualizada correctamente' });
  } catch (err) {
    console.error('Error al cambiar contrasena:', err);
    res.status(500).json({ message: 'Error al cambiar contrasena' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, username, full_name, dni, email, role, active FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en /me:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
