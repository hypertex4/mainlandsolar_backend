const mysql = require('mysql2/promise');
const env = require('./env');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
});

// Explicitly set session timezone on every new connection so NOW() is
// always UTC regardless of the MySQL server's global timezone setting.
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL database connected successfully');
    connection.release();
  } catch (error) {
    logger.error(`MySQL connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
