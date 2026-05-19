const { pool } = require('../config/database');

const findAll = async ({ page = 1, limit = 30, categoryId, brandId, minPrice, maxPrice, capacity, search, sort, isFeatured } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ["p.status = 'active'"];
  const params = [];

  if (categoryId) {
    conditions.push('p.category_id = ?');
    params.push(categoryId);
  }
  if (brandId) {
    conditions.push('p.brand_id = ?');
    params.push(brandId);
  }
  if (minPrice !== undefined && minPrice !== null) {
    conditions.push('p.price >= ?');
    params.push(minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    conditions.push('p.price <= ?');
    params.push(maxPrice);
  }
  if (capacity) {
    conditions.push('p.capacity = ?');
    params.push(capacity);
  }
  if (isFeatured !== undefined && isFeatured !== null) {
    conditions.push('p.is_featured = ?');
    params.push(isFeatured ? 1 : 0);
  }

  let searchClause = '';
  if (search) {
    searchClause = 'MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)';
    conditions.push(searchClause);
    params.push(search);
  }

  const where = conditions.join(' AND ');

  let orderBy;
  switch (sort) {
    case 'price_asc':  orderBy = 'p.price ASC';          break;
    case 'price_desc': orderBy = 'p.price DESC';         break;
    case 'newest':     orderBy = 'p.created_at DESC';    break;
    case 'popular':    orderBy = 'p.sort_order ASC';     break;
    default:           orderBy = 'p.sort_order ASC, p.created_at DESC';
  }

  const selectCols = `
    p.id, p.name, p.slug, p.sku, p.price, p.compare_at_price AS compare_price,
    p.category_id, p.brand_id, p.capacity, p.stock_qty AS stock_quantity,
    (p.stock_qty > 0) AS is_in_stock,
    p.is_featured, p.sort_order, p.created_at,
    c.name AS category_name, b.name AS brand_name,
    pi.image_path AS primary_image
  `;

  const joins = `
    LEFT JOIN product_categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_featured = 1
  `;

  let rows, total;

  try {
    const [dataRows] = await pool.query(
      `SELECT ${selectCols} FROM products p ${joins} WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total: cnt }]] = await pool.query(
      `SELECT COUNT(DISTINCT p.id) AS total FROM products p WHERE ${where}`,
      params
    );
    rows = dataRows;
    total = cnt;
  } catch (err) {
    if (search && err.message && err.message.includes('FULLTEXT')) {
      const paramsWithoutSearch = params.slice(0, params.length - 1);
      const likeConditions = [...conditions.filter((c) => c !== searchClause)];
      likeConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      const likeParams = [...paramsWithoutSearch, `%${search}%`, `%${search}%`];
      const likeWhere = likeConditions.join(' AND ');

      const [dataRows] = await pool.query(
        `SELECT ${selectCols} FROM products p ${joins} WHERE ${likeWhere} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        [...likeParams, limit, offset]
      );
      const [[{ total: cnt }]] = await pool.query(
        `SELECT COUNT(DISTINCT p.id) AS total FROM products p WHERE ${likeWhere}`,
        likeParams
      );
      rows = dataRows;
      total = cnt;
    } else {
      throw err;
    }
  }

  return { rows, total };
};

const findBySlug = async (slug) => {
  const [rows] = await pool.query(
    `SELECT p.*, p.compare_at_price AS compare_price, p.stock_qty AS stock_quantity,
            (p.stock_qty > 0) AS is_in_stock,
            c.name AS category_name, b.name AS brand_name
     FROM products p
     LEFT JOIN product_categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE p.slug = ? AND p.status = 'active' LIMIT 1`,
    [slug]
  );
  if (!rows[0]) return null;

  const product = rows[0];
  const [images] = await pool.query(
    `SELECT id, image_path AS url, is_featured AS is_primary, sort_order
     FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, is_featured DESC`,
    [product.id]
  );
  product.images = images;
  return product;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, p.compare_at_price AS compare_price, p.stock_qty AS stock_quantity,
            (p.stock_qty > 0) AS is_in_stock,
            c.name AS category_name, b.name AS brand_name
     FROM products p
     LEFT JOIN product_categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE p.id = ? AND p.status = 'active' LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;

  const product = rows[0];
  const [images] = await pool.query(
    `SELECT id, image_path AS url, is_featured AS is_primary, sort_order
     FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, is_featured DESC`,
    [product.id]
  );
  product.images = images;
  return product;
};

const findFeatured = async (limit = 8) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.slug, p.sku, p.price, p.compare_at_price AS compare_price,
            p.capacity, p.stock_qty AS stock_quantity, (p.stock_qty > 0) AS is_in_stock,
            p.sort_order, c.name AS category_name, b.name AS brand_name,
            pi.image_path AS primary_image
     FROM products p
     LEFT JOIN product_categories c ON c.id = p.category_id
     LEFT JOIN brands b ON b.id = p.brand_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_featured = 1
     WHERE p.is_featured = 1 AND p.status = 'active'
     ORDER BY p.sort_order ASC, p.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

const decrementStock = async (productId, quantity, connection) => {
  await connection.query(
    'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?',
    [quantity, productId]
  );
};

module.exports = { findAll, findBySlug, findById, findFeatured, decrementStock };
