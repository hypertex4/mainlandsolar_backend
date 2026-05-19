const { pool } = require('../config/database');

const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, slug, logo FROM brands WHERE is_active = 1 ORDER BY name ASC'
  );
  return rows;
};

const findBySlug = async (slug) => {
  const [rows] = await pool.query(
    'SELECT * FROM brands WHERE slug = ? AND is_active = 1 LIMIT 1',
    [slug]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM brands WHERE id = ? AND is_active = 1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

module.exports = { findAll, findBySlug, findById };
