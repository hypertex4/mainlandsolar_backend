CREATE DATABASE IF NOT EXISTS mainlandsolar_db;
USE mainlandsolar_db;

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  firstname   VARCHAR(100)  NOT NULL,
  lastname    VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NULL,
  google_id   VARCHAR(255)  NULL UNIQUE,
  avatar      VARCHAR(500)  NULL,
  is_active   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email     (email),
  INDEX idx_google_id (google_id)
);

CREATE TABLE IF NOT EXISTS otps (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  otp         VARCHAR(6)    NOT NULL,
  type        ENUM('activation', 'password_reset') NOT NULL,
  expires_at  TIMESTAMP     NOT NULL,
  is_used     TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type (user_id, type, is_used)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  token       TEXT          NOT NULL,
  expires_at  TIMESTAMP     NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NULL,
  action      VARCHAR(50)   NOT NULL,
  metadata    JSON          NULL,
  ip_address  VARCHAR(45)   NULL,
  user_agent  VARCHAR(500)  NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id  (user_id),
  INDEX idx_action   (action),
  INDEX idx_created  (created_at)
);

CREATE TABLE IF NOT EXISTS email_queue (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  from_address  VARCHAR(255)    NOT NULL,
  to_email      VARCHAR(255)    NOT NULL,
  subject       VARCHAR(500)    NOT NULL,
  html          LONGTEXT        NOT NULL,
  status        ENUM('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
  attempts      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts  TINYINT UNSIGNED NOT NULL DEFAULT 3,
  error         TEXT            NULL,
  queued_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  sent_at       TIMESTAMP       NULL,
  INDEX idx_status_queued (status, queued_at)
);
