import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';

async function initDatabase() {
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    console.log('Tablas creadas correctamente.');

    const existing = await client.query("SELECT id FROM users WHERE username = 'superadmin'");
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 12);
      await client.query(
        `INSERT INTO users (username, password_hash, full_name, email, role)
         VALUES ('superadmin', $1, 'Administrador GENES', 'admin@genesperu.earth', 'superadmin')`,
        [hash]
      );
      console.log('Usuario superadmin creado (password: admin123). CAMBIAR EN PRODUCCION.');
    }

    console.log('Base de datos inicializada correctamente.');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
