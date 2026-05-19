-- Migration 002: Extend existing admin tables for frontend API compatibility
-- Safe to re-run — all statements use IF NOT EXISTS or check column existence
-- via individual ALTER TABLE ADD COLUMN (MySQL ignores duplicate column errors
-- when wrapped per statement; run each block separately if any fails).

USE mainlandsolar_db;

-- ─── orders: add user_id for frontend API orders ─────────────────────────────
ALTER TABLE orders
  ADD COLUMN user_id INT UNSIGNED NULL AFTER customer_id,
  ADD INDEX  idx_user_id (user_id);

ALTER TABLE orders
  ADD CONSTRAINT orders_user_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ─── products: add ecommerce frontend columns ────────────────────────────────
ALTER TABLE products
  ADD COLUMN is_featured  TINYINT(1)    NOT NULL DEFAULT 0,
  ADD COLUMN capacity     VARCHAR(50)   NULL,
  ADD COLUMN brand_id     INT UNSIGNED  NULL,
  ADD COLUMN sort_order   INT UNSIGNED  NOT NULL DEFAULT 0,
  ADD INDEX  idx_featured (is_featured);

ALTER TABLE products
  ADD CONSTRAINT products_brand_fk
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;

-- ─── product_categories: add hierarchy + image ───────────────────────────────
ALTER TABLE product_categories
  ADD COLUMN parent_id INT UNSIGNED NULL AFTER id,
  ADD COLUMN image     VARCHAR(500) NULL;

ALTER TABLE product_categories
  ADD CONSTRAINT categories_parent_fk
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL;

-- ─── payments: extend for Paystack online payments ───────────────────────────
ALTER TABLE payments
  ADD COLUMN gateway          VARCHAR(50) NULL,
  ADD COLUMN currency         VARCHAR(10) NOT NULL DEFAULT 'NGN',
  ADD COLUMN gateway_response JSON        NULL,
  ADD COLUMN paid_at          DATETIME    NULL;

-- ─── solar_audits: add user link + extra booking fields ──────────────────────
ALTER TABLE solar_audits
  ADD COLUMN user_id       INT UNSIGNED                                          NULL AFTER customer_id,
  ADD COLUMN state         VARCHAR(100)                                          NULL AFTER city,
  ADD COLUMN building_type ENUM('residential','commercial','industrial','mixed_use') NULL,
  ADD COLUMN monthly_bill  DECIMAL(12,2)                                        NULL;

ALTER TABLE solar_audits
  ADD CONSTRAINT solar_audits_user_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
