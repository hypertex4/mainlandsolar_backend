const { pool } = require('../config/database');

const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT w.id, w.product_id, w.created_at,
            p.name AS product_name, p.slug AS product_slug, p.price,
            p.compare_price, p.is_in_stock, p.stock_quantity,
            pi.url AS image_url, pi.alt_text AS image_alt
     FROM wishlists w
     JOIN products p ON p.id = w.product_id
     LEFT JOIN product_images pi ON pi.product_id = w.product_id AND pi.is_primary = 1
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
};

const add = async (userId, productId) => {
  await pool.query(
    'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
    [userId, productId]
  );
};

const remove = async (userId, productId) => {
  await pool.query(
    'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
};

const exists = async (userId, productId) => {
  const [rows] = await pool.query(
    'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1',
    [userId, productId]
  );
  return rows.length > 0;
};

module.exports = { findByUserId, add, remove, exists };
