const { pool } = require('../config/database');

const enqueue = async (fromAddress, toEmail, subject, html) => {
  await pool.execute(
    'INSERT INTO email_queue (from_address, to_email, subject, html) VALUES (?, ?, ?, ?)',
    [fromAddress, toEmail, subject, html]
  );
};

// Claim a batch of pending jobs — increments attempt count atomically before returning them
// Uses pool.query (not execute) because mysql2 prepared statements reject LIMIT placeholders
const claimBatch = async (limit = 5) => {
  const n = parseInt(limit, 10);

  await pool.query(
    `UPDATE email_queue
     SET status = 'processing', attempts = attempts + 1
     WHERE status = 'pending' AND attempts < max_attempts
     ORDER BY queued_at ASC
     LIMIT ${n}`
  );

  const [rows] = await pool.query(
    `SELECT * FROM email_queue
     WHERE status = 'processing'
     ORDER BY queued_at ASC
     LIMIT ${n}`
  );

  return rows;
};

const markSent = async (id) => {
  await pool.execute(
    `UPDATE email_queue
     SET status = 'sent', sent_at = NOW(), error = NULL
     WHERE id = ?`,
    [id]
  );
};

// Returns to 'pending' for retry if attempts remain; otherwise marks 'failed'
const markFailed = async (id, attempts, maxAttempts, errorMessage) => {
  const status = attempts >= maxAttempts ? 'failed' : 'pending';
  await pool.execute(
    'UPDATE email_queue SET status = ?, error = ? WHERE id = ?',
    [status, errorMessage.substring(0, 500), id]
  );
};

// Resets jobs stuck in 'processing' (e.g. from a previous crash) back to 'pending'
// INTERVAL does not support placeholders in prepared statements — embed the safe integer directly
const resetStaleLocks = async (olderThanMinutes = 10) => {
  const n = parseInt(olderThanMinutes, 10);
  const [result] = await pool.query(
    `UPDATE email_queue
     SET status = 'pending'
     WHERE status = 'processing'
     AND queued_at < DATE_SUB(NOW(), INTERVAL ${n} MINUTE)`
  );
  return result.affectedRows;
};

const getStats = async () => {
  const [rows] = await pool.execute(
    'SELECT status, COUNT(*) AS count FROM email_queue GROUP BY status'
  );
  return rows;
};

module.exports = { enqueue, claimBatch, markSent, markFailed, resetStaleLocks, getStats };
