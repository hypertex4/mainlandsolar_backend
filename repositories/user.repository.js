const { pool } = require('../config/database');

const create = async ({ firstname, lastname, email, password }) => {
  const [result] = await pool.query(
    'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
    [firstname, lastname, email, password]
  );
  return result.insertId;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

// Safe profile view — excludes password
const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, firstname, lastname, email, google_id, avatar, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

// Full record including password — for internal auth checks only
const findByIdFull = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const findByGoogleId = async (googleId) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE google_id = ? LIMIT 1',
    [googleId]
  );
  return rows[0] || null;
};

const activate = async (userId) => {
  await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [userId]);
};

const update = async (userId, fields) => {
  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = [...keys.map((k) => fields[k]), userId];
  await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
};

module.exports = { create, findByEmail, findById, findByIdFull, findByGoogleId, activate, update };
