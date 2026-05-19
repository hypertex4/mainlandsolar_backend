const { pool } = require('../config/database');

const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
    [userId]
  );
  return rows;
};

const findById = async (id, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1',
    [id, userId]
  );
  return rows[0] || null;
};

const create = async (userId, data) => {
  if (data.is_default) {
    await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  }
  const [result] = await pool.query(
    `INSERT INTO addresses (user_id, label, full_name, phone, address_line, city, state, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.label || null,
      data.full_name,
      data.phone,
      data.address_line,
      data.city,
      data.state,
      data.is_default ? 1 : 0,
    ]
  );
  return result.insertId;
};

const update = async (id, userId, data) => {
  if (data.is_default) {
    await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  }
  const fields = ['label', 'full_name', 'phone', 'address_line', 'city', 'state', 'is_default'];
  const setClauses = [];
  const values = [];

  fields.forEach((f) => {
    if (data[f] !== undefined) {
      setClauses.push(`\`${f}\` = ?`);
      values.push(f === 'is_default' ? (data[f] ? 1 : 0) : data[f]);
    }
  });

  if (setClauses.length === 0) return;
  values.push(id, userId);
  await pool.query(
    `UPDATE addresses SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );
};

const deleteAddress = async (id, userId) => {
  await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
};

module.exports = { findByUserId, findById, create, update, delete: deleteAddress };
