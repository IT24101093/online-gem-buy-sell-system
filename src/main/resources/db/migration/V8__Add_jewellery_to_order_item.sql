/* ============================================================
   V8__Add_jewellery_to_order_item.sql
   - Adds support for Jewellery items in the orders.
   - Makes listing_id nullable to allow either Gems or Jewellery.
   ============================================================ */

-- 1. Add the jewellery_id column to the order_item table
ALTER TABLE order_item
    ADD COLUMN jewellery_id BIGINT NULL AFTER listing_id;

-- 2. Modify listing_id to be NULL (so you can buy jewelry WITHOUT a gem)
ALTER TABLE order_item
    MODIFY COLUMN listing_id BIGINT NULL;

-- 3. Add the foreign key so the database knows it's a jewelry item
ALTER TABLE order_item
    ADD CONSTRAINT fk_order_item_jewellery
        FOREIGN KEY (jewellery_id) REFERENCES jewellery_item(jewellery_id)
            ON DELETE CASCADE;