require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const emailWorker = require('./workers/email.worker');
const logger = require('./utils/logger');
const env = require('./config/env');

const start = async () => {
  await connectDB();

  emailWorker.start();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    emailWorker.stop();
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
