/* =========================
   FINANCE MANAGEMENT (New)
   ========================= */
CREATE TABLE IF NOT EXISTS corporate_assets (
                                                asset_id    BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                name        VARCHAR(120) NOT NULL,
                                                category    ENUM('FIXED','CURRENT','INTANGIBLE') NOT NULL,
                                                value_lkr   DECIMAL(14,2) NOT NULL,
                                                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS corporate_liabilities (
                                                     liability_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                     description  VARCHAR(255) NOT NULL,
                                                     amount_lkr   DECIMAL(14,2) NOT NULL,
                                                     due_date     DATE,
                                                     created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;