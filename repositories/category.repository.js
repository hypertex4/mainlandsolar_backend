const { pool } = require('../config/database');

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT id, name, slug, parent_id, description, image, sort_order
     FROM product_categories WHERE status = 'active' ORDER BY sort_order ASC, name ASC`
  );

  const map = {};
  rows.forEach((row) => { map[row.id] = { ...row, children: [] }; });

  const roots = [];
  rows.forEach((row) => {
    if (row.parent_id && map[row.parent_id]) {
      map[row.parent_id].children.push(map[row.id]);
    } else {
      roots.push(map[row.id]);
    }
  });

  return roots;
};

const findBySlug = async (slug) => {
  const [rows] = await pool.query(
    "SELECT * FROM product_categories WHERE slug = ? AND status = 'active' LIMIT 1",
    [slug]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM product_categories WHERE id = ? AND status = 'active' LIMIT 1",
    [id]
  );
  return rows[0] || null;
};

module.exports = { findAll, findBySlug, findById };
