import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mysql from 'mysql2/promise';

export const app = express();
app.use(cors());
app.use(express.json());

const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Faltan variables de base de datos: ${missing.join(', ')}`);

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export function validUser(payload) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  if (!name || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 150) return null;
  return { name, email };
}

export function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok', database: 'connected' });
  } catch {
    response.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

app.get('/api/users', async (_request, response, next) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id DESC');
    response.json(users);
  } catch (error) { next(error); }
});

app.get('/api/users/stats', async (_request, response, next) => {
  try {
    const [[stats]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    response.json({ total: stats.total });
  } catch (error) { next(error); }
});

app.get('/api/users/:id', async (request, response, next) => {
  const id = validId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Identificador inválido.' });
  try {
    const [[user]] = await pool.execute('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
    if (!user) return response.status(404).json({ error: 'Usuario no encontrado.' });
    response.json(user);
  } catch (error) { next(error); }
});

app.post('/api/users', async (request, response, next) => {
  const user = validUser(request.body);
  if (!user) return response.status(400).json({ error: 'Nombre y correo válido son obligatorios.' });
  try {
    const [result] = await pool.execute('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email]);
    response.status(201).json({ id: result.insertId, ...user });
  } catch (error) { next(error); }
});

app.put('/api/users/:id', async (request, response, next) => {
  const id = validId(request.params.id);
  const user = validUser(request.body);
  if (!id) return response.status(400).json({ error: 'Identificador inválido.' });
  if (!user) return response.status(400).json({ error: 'Nombre y correo válido son obligatorios.' });
  try {
    const [result] = await pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [user.name, user.email, id]);
    if (!result.affectedRows) return response.status(404).json({ error: 'Usuario no encontrado.' });
    response.json({ id, ...user });
  } catch (error) { next(error); }
});

app.delete('/api/users/:id', async (request, response, next) => {
  const id = validId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Identificador inválido.' });
  try {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (!result.affectedRows) return response.status(404).json({ error: 'Usuario no encontrado.' });
    response.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _request, response, _next) => {
  if (error?.code === 'ER_DUP_ENTRY') return response.status(409).json({ error: 'El correo ya existe.' });
  console.error(error);
  response.status(500).json({ error: 'No fue posible completar la operación.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(process.env.PORT || 3000), () => console.log('API disponible en el puerto ' + (process.env.PORT || 3000)));
}
