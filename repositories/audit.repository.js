const { pool } = require('../config/database');

const create = async (data) => {
  const auditRef = 'SA-' + Date.now();
  const [result] = await pool.query(
    `INSERT INTO solar_audits
       (audit_ref, user_id, customer_name, customer_phone, customer_email,
        address, city, state, building_type, monthly_bill,
        preferred_date, preferred_time, audit_notes, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'website')`,
    [
      auditRef,
      data.user_id || null,
      data.full_name,
      data.phone,
      data.email,
      data.address,
      data.city,
      data.state || null,
      data.building_type || null,
      data.monthly_bill || null,
      data.preferred_date,
      data.preferred_time,
      data.notes || null,
    ]
  );
  return result.insertId;
};

const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM solar_audits WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM solar_audits WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const getBookedSlots = async (date) => {
  const [rows] = await pool.query(
    `SELECT preferred_time, COUNT(*) AS count
     FROM solar_audits
     WHERE preferred_date = ? AND status != 'cancelled'
     GROUP BY preferred_time`,
    [date]
  );
  return rows;
};

module.exports = { create, findByUserId, findById, getBookedSlots };
