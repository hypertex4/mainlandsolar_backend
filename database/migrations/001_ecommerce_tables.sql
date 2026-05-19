-- Migration 001: New ecommerce tables
-- Run against your existing database. Creates only tables that do not yet exist.
-- Tables already present (created by admin dashboard) are skipped:
--   products, product_categories, product_images, orders, order_items,
--   payments, solar_audits, order_status_history, settings
--
-- NOTE: If the existing products / orders / payments tables are missing columns
-- that the API expects, add ALTER TABLE statements here as needed.

USE mainlandsolar_db;

-- ─── New tables ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  slug       VARCHAR(120)  NOT NULL UNIQUE,
  logo       VARCHAR(500)  NULL,
  is_active  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
);

CREATE TABLE IF NOT EXISTS carts (
  id            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  session_token CHAR(64)      NOT NULL UNIQUE,
  user_id       INT UNSIGNED  NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_token (session_token),
  INDEX idx_user_id       (user_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  cart_id     INT UNSIGNED   NOT NULL,
  product_id  INT UNSIGNED   NOT NULL,
  quantity    INT UNSIGNED   NOT NULL DEFAULT 1,
  unit_price  DECIMAL(12,2)  NOT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY  uq_cart_product (cart_id, product_id),
  FOREIGN KEY (cart_id)    REFERENCES carts(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_cart_id (cart_id)
);

CREATE TABLE IF NOT EXISTS addresses (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NOT NULL,
  label        VARCHAR(50)   NULL,
  full_name    VARCHAR(200)  NOT NULL,
  phone        VARCHAR(20)   NOT NULL,
  address_line VARCHAR(255)  NOT NULL,
  city         VARCHAR(100)  NOT NULL,
  state        VARCHAR(100)  NOT NULL,
  is_default   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  product_id  INT UNSIGNED  NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY  uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id          INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED     NOT NULL,
  user_id     INT UNSIGNED     NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL,
  title       VARCHAR(255)     NULL,
  body        TEXT             NULL,
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY  uq_user_product (user_id, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_product_id (product_id)
);
