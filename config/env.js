require("dotenv").config();

module.exports = {
  PORT: parseInt(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  JWT_RESET_EXPIRES: process.env.JWT_RESET_EXPIRES || "5m",

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM_NAME:
    process.env.MAIL_FROM_NAME || process.env.APP_NAME || "Mainland Solar",
  MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS || process.env.SMTP_FROM,
  SUPPORT_EMAIL:
    process.env.SUPPORT_EMAIL ||
    process.env.MAIL_FROM_ADDRESS ||
    process.env.SMTP_FROM,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:4500",
  CORS_ORIGINS: process.env.CORS_ORIGINS || null,
  APP_NAME: process.env.APP_NAME || "Mainland Solar",
};
