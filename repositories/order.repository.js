const { pool } = require('../config/database');

const create = async (userId, data, items) => {
  const connection = await pool.getConnection();
  try {
    const orderNumber = 'MS-' + Date.now();
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, user_id, status, subtotal, shipping_fee, total, payment_status, shipping_address, notes)
       VALUES (?, ?, 'pending', ?, ?, ?, 'unpaid', ?, ?)`,
      [
        orderNumber,
        userId,
        data.subtotal,
        data.shipping_fee || 0,
        data.total,
        JSON.stringify(data.shipping_address),
        data.notes || null,
      ]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.product_sku || null,
          item.quantity,
          item.unit_price,
          item.subtotal,
        ]
      );
    }

    return orderId;
  } finally {
    connection.release();
  }
};

const findByUserId = async (userId, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT o.*, COUNT(oi.id) AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
    [userId]
  );
  return { rows, total };
};

const findById = async (id, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1',
    [id, userId]
  );
  if (!rows[0]) return null;

  const order = rows[0];
  const [items] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ?',
    [order.id]
  );
  order.items = items;
  return order;
};

const findByIdAdmin = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE id = ? LIMIT 1',
    [id]
  );
  if (!rows[0]) return null;

  const order = rows[0];
  const [items] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ?',
    [order.id]
  );
  order.items = items;
  return order;
};

const updateStatus = async (id, status) => {
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
};

const updatePaymentStatus = async (id, paymentStatus) => {
  await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [paymentStatus, id]);
};

const findByOrderNumber = async (orderNumber) => {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE order_number = ? LIMIT 1',
    [orderNumber]
  );
  return rows[0] || null;
};

module.exports = {
  create,
  findByUserId,
  findById,
  findByIdAdmin,
  updateStatus,
  updatePaymentStatus,
  findByOrderNumber,
};
