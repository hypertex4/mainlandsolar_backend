const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const env = require('./config/env');

const app = express();

app.use(helmet());
const allowedOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [env.CLIENT_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Prevent WordPress / LiteSpeed / server-level HTTP caches from storing
// API responses. Without this, caching plugins on the same cPanel server
// serve stale JSON to every caller until the cache TTL expires.
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
