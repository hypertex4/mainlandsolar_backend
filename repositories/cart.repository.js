const crypto = require('crypto');
const { pool } = require('../config/database');

const findByToken = async (token) => {
  const [rows] = await pool.query(
    'SELECT * FROM carts WHERE session_token = ? LIMIT 1',
    [token]
  );
  return rows[0] || null;
};

const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM carts WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
};

const create = async (token, userId = null) => {
  const [result] = await pool.query(
    'INSERT INTO carts (session_token, user_id) VALUES (?, ?)',
    [token, userId]
  );
  return result.insertId;
};

const mergeGuestCart = async (guestToken, userId) => {
  const guestCart = await findByToken(guestToken);
  if (!guestCart) return;

  let userCart = await findByUserId(userId);
  if (!userCart) {
    const newToken = crypto.randomBytes(32).toString('hex');
    const cartId = await create(newToken, userId);
    userCart = { id: cartId };
  }

  const [guestItems] = await pool.query(
    'SELECT product_id, quantity, unit_price FROM cart_items WHERE cart_id = ?',
    [guestCart.id]
  );

  for (const item of guestItems) {
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userCart.id, item.product_id, item.quantity, item.unit_price]
    );
  }

  await pool.query('DELETE FROM carts WHERE id = ?', [guestCart.id]);
};

const linkToUser = async (cartId, userId) => {
  await pool.query('UPDATE carts SET user_id = ? WHERE id = ?', [userId, cartId]);
};

const getItems = async (cartId) => {
  const [rows] = await pool.query(
    `SELECT ci.id, ci.product_id, ci.quantity, ci.unit_price,
            p.name AS product_name, p.slug AS product_slug, p.sku AS product_sku,
            p.stock_quantity, p.is_in_stock,
            pi.url AS image_url, pi.alt_text AS image_alt
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_images pi ON pi.product_id = ci.product_id AND pi.is_primary = 1
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at ASC`,
    [cartId]
  );
  return rows;
};

const addItem = async (cartId, productId, quantity, unitPrice) => {
  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cartId, productId, quantity, unitPrice]
  );
};

const updateItem = async (cartId, itemId, quantity) => {
  await pool.query(
    'UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?',
    [quantity, itemId, cartId]
  );
};

const removeItem = async (cartId, itemId) => {
  await pool.query(
    'DELETE FROM cart_items WHERE id = ? AND cart_id = ?',
    [itemId, cartId]
  );
};

const clearItems = async (cartId) => {
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
};

const deleteCart = async (cartId) => {
  await pool.query('DELETE FROM carts WHERE id = ?', [cartId]);
};

module.exports = {
  findByToken,
  findByUserId,
  create,
  mergeGuestCart,
  linkToUser,
  getItems,
  addItem,
  updateItem,
  removeItem,
  clearItems,
  deleteCart,
};
