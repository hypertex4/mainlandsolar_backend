const { pool } = require('../config/database');

const log = async (userId, action, metadata, ipAddress, userAgent) => {
  await pool.execute(
    'INSERT INTO activity_logs (user_id, action, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
    [userId || null, action, JSON.stringify(metadata || {}), ipAddress || null, userAgent || null]
  );
};

const findByUserId = async (userId, limit = 50) => {
  const [rows] = await pool.execute(
    'SELECT id, action, metadata, ip_address, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
};

module.exports = { log, findByUserId };
