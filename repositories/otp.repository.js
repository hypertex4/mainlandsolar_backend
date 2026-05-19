const { pool } = require('../config/database');

// Uses pool.query (client-side escaping) throughout — avoids server-side prepared
// statement quirks on cPanel's MySQL/MariaDB with TIMESTAMP and VARCHAR comparisons.

const upsert = async (userId, otp, type, expiryMinutes = 10) => {
  const n = parseInt(expiryMinutes, 10);
  await pool.query(
    'UPDATE otps SET is_used = 1 WHERE user_id = ? AND type = ? AND is_used = 0',
    [userId, type]
  );
  await pool.query(
    `INSERT INTO otps (user_id, otp, type, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ${n} MINUTE))`,
    [userId, otp, type]
  );
};

const findValid = async (userId, otp, type) => {
  const [rows] = await pool.query(
    'SELECT * FROM otps WHERE user_id = ? AND otp = ? AND type = ? AND is_used = 0 AND expires_at > NOW() LIMIT 1',
    [userId, otp, type]
  );
  return rows[0] || null;
};

const markUsed = async (id) => {
  await pool.query('UPDATE otps SET is_used = 1 WHERE id = ?', [id]);
};

module.exports = { upsert, findValid, markUsed };
