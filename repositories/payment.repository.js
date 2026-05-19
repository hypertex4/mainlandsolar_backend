const { pool } = require('../config/database');

const create = async (orderId, reference, amount) => {
  const [result] = await pool.query(
    `INSERT INTO payments (order_id, payment_ref, method, gateway, amount, status)
     VALUES (?, ?, 'online', 'paystack', ?, 'pending')`,
    [orderId, reference, amount]
  );
  return result.insertId;
};

const findByReference = async (reference) => {
  const [rows] = await pool.query(
    'SELECT * FROM payments WHERE payment_ref = ? LIMIT 1',
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
  // status mapping: 'success'→'confirmed', 'failed'→'rejected', 'pending'→'pending'
  const dbStatus = status === 'success' ? 'confirmed' : status === 'failed' ? 'rejected' : status;
  await pool.query(
    'UPDATE payments SET status = ?, gateway_response = ?, paid_at = ? WHERE id = ?',
    [dbStatus, gatewayResponse ? JSON.stringify(gatewayResponse) : null, paidAt, id]
  );
};

module.exports = { create, findByReference, findByOrderId, updateStatus };
