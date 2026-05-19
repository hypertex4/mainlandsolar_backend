const { pool } = require('../config/database');

const findByProductId = async (productId, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at,
            u.firstname, u.lastname
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? AND r.status = 'approved'
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [productId, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM reviews WHERE product_id = ? AND status = 'approved'",
    [productId]
  );
  return { rows, total };
};

const create = async (productId, userId, data) => {
  const [result] = await pool.query(
    `INSERT INTO reviews (product_id, user_id, rating, title, body)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, userId, data.rating, data.title || null, data.body || null]
  );
  return result.insertId;
};

const findByUserAndProduct = async (userId, productId) => {
  const [rows] = await pool.query(
    'SELECT * FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1',
    [userId, productId]
  );
  return rows[0] || null;
};

const getAverageRating = async (productId) => {
  const [rows] = await pool.query(
    "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews FROM reviews WHERE product_id = ? AND status = 'approved'",
    [productId]
  );
  return {
    avg_rating: rows[0].avg_rating ? parseFloat(rows[0].avg_rating).toFixed(1) : null,
    total_reviews: rows[0].total_reviews,
  };
};

module.exports = { findByProductId, create, findByUserAndProduct, getAverageRating };
