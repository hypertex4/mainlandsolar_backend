const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this value already exists';
  }

  if (!err.isOperational) {
    logger.error(err);
    if (process.env.NODE_ENV === 'production') {
      message = 'Something went wrong. Please try again later.';
    }
  }

  res.status(statusCode).json({ status: 'error', message });
};

module.exports = { notFound, errorHandler };
