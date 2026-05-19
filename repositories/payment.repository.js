const { pool } = require('../config/database');

const create = async (orderId, reference, amount) => {
  const [result] = await pool.query(
    `INSERT INTO payments (order_id, reference, amount, status)
     VALUES (?, ?, ?, 'pending')`,
    [orderId, reference, amount]
  );
  return result.insertId;
};

const findByReference = async (reference) => {
  const [rows] = await pool.query(
    'SELECT * FROM payments WHERE reference = ? LIMIT 1',
    [reference]
  );
  return rows[0] || null;
};

const findByOrderId = async (orderId) => {
  const [rows] = await pool.query(
    'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
    [orderId]
  );
  return rows;
};

const updateStatus = async (id, status, gatewayResponse, paidAt = null) => {
  await pool.query(
    'UPDATE payments SET status = ?, gateway_response = ?, paid_at = ? WHERE id = ?',
    [status, gatewayResponse ? JSON.stringify(gatewayResponse) : null, paidAt, id]
  );
};

module.exports = { create, findByReference, findByOrderId, updateStatus };
