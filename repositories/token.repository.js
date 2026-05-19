const { pool } = require('../config/database');

const save = async (userId, token, expiresAt) => {
  await pool.execute(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

const findByToken = async (token) => {
  const [rows] = await pool.execute(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1',
    [token]
  );
  return rows[0] || null;
};

const deleteByToken = async (token) => {
  await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

const deleteByUserId = async (userId) => {
  await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
};

module.exports = { save, findByToken, deleteByToken, deleteByUserId };
