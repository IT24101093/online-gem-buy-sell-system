/* ============================================================
   GEMTRADE DB — V1__init.sql (Flyway) — FINAL (Order = 4 tables)
   - MySQL 8+
   - Do NOT put CREATE DATABASE / CREATE USER / GRANT here
   ============================================================ */

CREATE TABLE seller (
                        seller_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
                        name        VARCHAR(120) NOT NULL,
                        nic         VARCHAR(20)  NOT NULL UNIQUE,
                        phone       VARCHAR(20)  NOT NULL,
                        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* =========================
   INVENTORY
   ========================= */
CREATE TABLE inventory_item (
                                inventory_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,

                                inventory_code    VARCHAR(30) NOT NULL UNIQUE,
                                source            ENUM('CERTIFIED','ANALYSIS') NOT NULL,

                                gem_type          VARCHAR(80) NOT NULL,
                                category          VARCHAR(80) NULL,

                                weight_ct         DECIMAL(10,3) NULL,
                                estimated_value_lkr DECIMAL(14,2) NULL,

                                description       TEXT NULL,
                                description_mode  ENUM('MANUAL','AUTO') NULL,
                                description_updated_at TIMESTAMP NULL,

                                seller_id         BIGINT NULL,

                                status            ENUM('IN_STOCK','PENDING_MARKET','PUBLISHED','SOLD','REMOVED')
                   NOT NULL DEFAULT 'IN_STOCK',

                                created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

                                CONSTRAINT fk_inventory_item_seller
                                    FOREIGN KEY (seller_id) REFERENCES seller(seller_id)
) ENGINE=InnoDB;

CREATE INDEX idx_inventory_source  ON inventory_item(source);
CREATE INDEX idx_inventory_status  ON inventory_item(status);
CREATE INDEX idx_inventory_gemtype ON inventory_item(gem_type);
CREATE INDEX idx_inventory_seller  ON inventory_item(seller_id);

CREATE TABLE inventory_image (
                                 image_id           BIGINT PRIMARY KEY AUTO_INCREMENT,
                                 inventory_item_id  BIGINT NOT NULL,

                                 image_url          VARCHAR(500) NULL,
                                 image_path         VARCHAR(500) NULL,

                                 is_primary         BOOLEAN NOT NULL DEFAULT FALSE,
                                 sort_order         INT NOT NULL DEFAULT 0,

                                 created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                 primary_flag       TINYINT GENERATED ALWAYS AS (
                                     CASE WHEN is_primary THEN 1 ELSE NULL END
                                     ) STORED,

                                 CONSTRAINT fk_inventory_image_item
                                     FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(inventory_item_id)
                                         ON DELETE CASCADE,

                                 UNIQUE KEY uq_one_primary_per_item (inventory_item_id, primary_flag),
                                 INDEX idx_inventory_image_item (inventory_item_id),
                                 INDEX idx_inventory_image_sort (inventory_item_id, sort_order)
) ENGINE=InnoDB;

/* Optional: certificate */
CREATE TABLE gem_certificate (
                                 certificate_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
                                 inventory_item_id  BIGINT NOT NULL UNIQUE,

                                 certificate_no     VARCHAR(80) NOT NULL UNIQUE,
                                 lab_name           VARCHAR(120) NULL,
                                 issue_date         DATE NULL,
                                 report_url         VARCHAR(500) NULL,

                                 created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                 CONSTRAINT fk_certificate_item
                                     FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(inventory_item_id)
                                         ON DELETE CASCADE
) ENGINE=InnoDB;

/* Optional: smart analysis report */
CREATE TABLE validation_report (
                                   report_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
                                   inventory_item_id  BIGINT NOT NULL UNIQUE,

                                   color_tone         ENUM('BLUE','YELLOW','PINK','GREEN','OTHER')
                    NOT NULL DEFAULT 'OTHER',

                                   specific_gravity   DECIMAL(10,4) NULL,
                                   volume_mm3         DECIMAL(18,4) NULL,
                                   estimated_carat    DECIMAL(10,3) NULL,
                                   yield_percent      DECIMAL(6,2) NULL,

                                   generated_description TEXT NULL,
                                   raw_json           JSON NULL,

                                   created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                   CONSTRAINT fk_report_item
                                       FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(inventory_item_id)
                                           ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_validation_color ON validation_report(color_tone);

/* =========================
   MARKETPLACE
   ========================= */
CREATE TABLE marketplace_listing_draft (
                                           draft_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
                                           inventory_item_id BIGINT NOT NULL UNIQUE,

                                           gemstone_name     VARCHAR(120) NOT NULL,
                                           category          VARCHAR(80)  NOT NULL,

                                           description_snapshot TEXT NULL,

                                           suggested_price_lkr DECIMAL(14,2) NULL,
                                           admin_price_lkr     DECIMAL(14,2) NULL,

                                           status           ENUM('PENDING','APPROVED','REJECTED')
                  NOT NULL DEFAULT 'PENDING',

                                           created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                           updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,

                                           CONSTRAINT fk_draft_inventory_item
                                               FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(inventory_item_id)
) ENGINE=InnoDB;

CREATE INDEX idx_draft_status  ON marketplace_listing_draft(status);
CREATE INDEX idx_draft_created ON marketplace_listing_draft(created_at);

CREATE TABLE marketplace_listing (
                                     listing_id        BIGINT PRIMARY KEY AUTO_INCREMENT,

                                     draft_id          BIGINT NOT NULL UNIQUE,
                                     inventory_item_id BIGINT NOT NULL UNIQUE,

                                     gemstone_name     VARCHAR(120) NOT NULL,
                                     category          VARCHAR(80)  NOT NULL,
                                     description       TEXT NULL,

                                     price_lkr         DECIMAL(14,2) NOT NULL,
                                     main_image_url    VARCHAR(500) NOT NULL,

                                     color_tone        ENUM('BLUE','YELLOW','PINK','GREEN','OTHER')
                   NOT NULL DEFAULT 'OTHER',

                                     status            ENUM('ACTIVE','PAUSED','SOLD')
                   NOT NULL DEFAULT 'ACTIVE',

                                     published_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,

                                     CONSTRAINT fk_listing_draft
                                         FOREIGN KEY (draft_id) REFERENCES marketplace_listing_draft(draft_id),

                                     CONSTRAINT fk_listing_inventory_item
                                         FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(inventory_item_id)
) ENGINE=InnoDB;

CREATE INDEX idx_listing_status   ON marketplace_listing(status);
CREATE INDEX idx_listing_price    ON marketplace_listing(price_lkr);
CREATE INDEX idx_listing_color    ON marketplace_listing(color_tone);
CREATE INDEX idx_listing_category ON marketplace_listing(category);

/* =========================
   ORDER (4 tables only)
   ========================= */
CREATE TABLE cart (
                      cart_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
                      status      ENUM('ACTIVE','CHECKED_OUT') NOT NULL DEFAULT 'ACTIVE',
                      created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE cart_item (
                           cart_item_id    BIGINT PRIMARY KEY AUTO_INCREMENT,
                           cart_id         BIGINT NOT NULL,

                           listing_id      BIGINT NOT NULL,
                           gem_name        VARCHAR(120) NOT NULL,
                           unit_price_lkr  DECIMAL(14,2) NOT NULL,

                           created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                           CONSTRAINT fk_cart_item_cart
                               FOREIGN KEY (cart_id) REFERENCES cart(cart_id)
                                   ON DELETE CASCADE,

                           CONSTRAINT fk_cart_item_listing
                               FOREIGN KEY (listing_id) REFERENCES marketplace_listing(listing_id),

                           UNIQUE KEY uq_cart_listing (cart_id, listing_id)
) ENGINE=InnoDB;

CREATE INDEX idx_cart_item_cart ON cart_item(cart_id);

CREATE TABLE orders (
                        id               BIGINT PRIMARY KEY AUTO_INCREMENT,

                        order_code       VARCHAR(30) NOT NULL UNIQUE,

                        customer_name    VARCHAR(120) NOT NULL,
                        customer_phone   VARCHAR(20)  NOT NULL,
                        delivery_address VARCHAR(255) NOT NULL,
                        customer_nic     VARCHAR(20)  NOT NULL,
                        customer_age     INT          NOT NULL,

                        total_amount_lkr DECIMAL(14,2) NOT NULL,

                        status           ENUM('PROCESSING','PACKED','DELIVERED')
                  NOT NULL DEFAULT 'PROCESSING',

                        packed_at        TIMESTAMP NULL,
                        delivered_at     TIMESTAMP NULL,

                        created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_phone  ON orders(customer_phone);

CREATE TABLE order_item (
                            order_item_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
                            order_id        BIGINT NOT NULL,

                            listing_id      BIGINT NOT NULL,
                            gem_name        VARCHAR(120) NOT NULL,
                            unit_price_lkr  DECIMAL(14,2) NOT NULL,

                            CONSTRAINT fk_order_item_order
                                FOREIGN KEY (order_id) REFERENCES orders(id)
                                    ON DELETE CASCADE,

                            CONSTRAINT fk_order_item_listing
                                FOREIGN KEY (listing_id) REFERENCES marketplace_listing(listing_id),

                            UNIQUE KEY uq_order_listing (order_id, listing_id)
) ENGINE=InnoDB;

CREATE INDEX idx_order_item_order ON order_item(order_id);

/* =========================
   FEEDBACK
   ========================= */
CREATE TABLE order_feedback (
                                feedback_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                order_id    BIGINT NOT NULL UNIQUE,

                                rating      TINYINT NOT NULL,
                                comment     TEXT NULL,

                                created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

                                CONSTRAINT fk_feedback_order
                                    FOREIGN KEY (order_id) REFERENCES orders(id)
                                        ON DELETE CASCADE,

                                CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE INDEX idx_feedback_created ON order_feedback(created_at);

/* =========================
   PAYMENT
   ========================= */
CREATE TABLE payment_transaction (
                                     payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     order_id VARCHAR(30) NOT NULL,
                                     subtotal_lkr DECIMAL(14,2),
                                     addons_lkr DECIMAL(14,2),
                                     shipping_lkr DECIMAL(14,2),
                                     tax_lkr DECIMAL(14,2),
                                     discount_lkr DECIMAL(14,2),
                                     total_amount_lkr DECIMAL(14,2),
                                     method ENUM('CARD', 'CASH') NOT NULL,
                                     status ENUM('SUCCESS', 'FAILED') NOT NULL,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   FINANCE MANAGEMENT (New)
   ========================= */
CREATE TABLE corporate_assets (
                                  asset_id    BIGINT PRIMARY KEY AUTO_INCREMENT,
                                  name        VARCHAR(120) NOT NULL,
                                  category    ENUM('FIXED','CURRENT','INTANGIBLE') NOT NULL,
                                  value_lkr   DECIMAL(14,2) NOT NULL,
                                  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE corporate_liabilities (
                                       liability_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                       description  VARCHAR(255) NOT NULL,
                                       amount_lkr   DECIMAL(14,2) NOT NULL,
                                       due_date     DATE,
                                       created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* =========================
   REFERENCE TABLES
   ========================= */
CREATE TABLE specific_gravity (
                                  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
                                  material  VARCHAR(60) NOT NULL UNIQUE,
                                  sg_value  DECIMAL(10,4) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE shape_factor (
                              id     BIGINT PRIMARY KEY AUTO_INCREMENT,
                              shape  VARCHAR(40) NOT NULL UNIQUE,
                              factor DECIMAL(10,6) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE yield_factor (
                              id            BIGINT PRIMARY KEY AUTO_INCREMENT,
                              rough_shape   VARCHAR(40) NOT NULL UNIQUE,
                              yield_percent DECIMAL(6,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE base_price_per_carat (
                                      id              BIGINT PRIMARY KEY AUTO_INCREMENT,
                                      gem_type        VARCHAR(60) NOT NULL,
                                      base_price_lkr  DECIMAL(14,2) NOT NULL,
                                      min_carat       DECIMAL(10,3) NULL,
                                      max_carat       DECIMAL(10,3) NULL,
                                      UNIQUE KEY uq_base_price (gem_type, min_carat, max_carat)
) ENGINE=InnoDB;

CREATE TABLE multiplier (
                            id               BIGINT PRIMARY KEY AUTO_INCREMENT,
                            category         ENUM('COLOR','CLARITY','CUT','OTHER') NOT NULL,
                            grade_code       VARCHAR(20) NOT NULL,
                            multiplier_value DECIMAL(10,6) NOT NULL,
                            UNIQUE KEY uq_multiplier (category, grade_code)
) ENGINE=InnoDB;