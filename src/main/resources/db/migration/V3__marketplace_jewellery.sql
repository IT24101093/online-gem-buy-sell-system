/* ============================================================
   V3__marketplace_jewellery.sql  (Flyway migration)
   Adds tables for:
     1. gem_carat_variant   – carat-wise pricing per listing
     2. jewellery_item      – jewellery managed by admin
     3. jewellery_gem_category – gem categories per jewellery

   Also adds:
     - origin column to marketplace_listing (country of origin filter)

   NO existing tables from other modules are modified.
   ============================================================ */

-- 1. Add origin column to marketplace_listing (your table, your module)
ALTER TABLE marketplace_listing
    ADD COLUMN origin VARCHAR(80) NULL COMMENT 'Country of origin (e.g. Sri Lanka)' AFTER color_tone;

CREATE INDEX idx_listing_origin ON marketplace_listing(origin);

-- 2. Gem carat variants – one listing can have many carat/price options
CREATE TABLE gem_carat_variant (
    variant_id  BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id  BIGINT NOT NULL,
    carat_value DECIMAL(10,3) NOT NULL COMMENT 'Weight in carats',
    price_lkr   DECIMAL(14,2) NOT NULL COMMENT 'Price for this carat size in LKR',

    CONSTRAINT fk_variant_listing
        FOREIGN KEY (listing_id) REFERENCES marketplace_listing(listing_id)
            ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Carat-wise pricing variants for marketplace listings';

CREATE INDEX idx_variant_listing ON gem_carat_variant(listing_id);

-- 3. Jewellery items managed by the admin
CREATE TABLE jewellery_item (
    jewellery_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    jewellery_type VARCHAR(60)  NOT NULL COMMENT 'Ring, Pendant, Necklace, Earrings, Bracelet',
    metal_colour   VARCHAR(40)  NOT NULL COMMENT 'Gold, Silver, Platinum',
    image_path     VARCHAR(500) NULL     COMMENT 'Relative path to uploaded image',
    price_lkr      DECIMAL(14,2) NULL    COMMENT 'Display price shown to users',
    gemstone_name  VARCHAR(120) NULL     COMMENT 'Featured gemstone name shown to users',
    description    TEXT         NULL,

    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Jewellery listings managed via admin Jewellery Management page';

CREATE INDEX idx_jwl_type  ON jewellery_item(jewellery_type);
CREATE INDEX idx_jwl_metal ON jewellery_item(metal_colour);

-- 4. Suitable gem categories per jewellery (one-to-many)
CREATE TABLE jewellery_gem_category (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    jewellery_id   BIGINT NOT NULL,
    category_name  VARCHAR(80) NOT NULL COMMENT 'E.g. Sapphire, Ruby, Emerald',

    CONSTRAINT fk_jwl_cat_jewellery
        FOREIGN KEY (jewellery_id) REFERENCES jewellery_item(jewellery_id)
            ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Gem categories suitable for each jewellery item';

CREATE INDEX idx_jwl_cat_jewellery ON jewellery_gem_category(jewellery_id);
