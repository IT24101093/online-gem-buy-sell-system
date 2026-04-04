/* ============================================================
   V6__Add_jewellery_support_to_cart.sql
   - Adds support for Jewellery items in the cart.
   - Makes listing_id nullable to allow either Gems or Jewellery.
   ============================================================ */

-- 1. Add the jewellery_id column to the cart_item table
ALTER TABLE cart_item
    ADD COLUMN jewellery_id BIGINT NULL AFTER listing_id;

-- 2. Modify listing_id to be NULL (it was NOT NULL in V1)
-- This allows an item to be a Jewelry piece instead of a Gem listing
ALTER TABLE cart_item
    MODIFY COLUMN listing_id BIGINT NULL;

-- 3. Add a Foreign Key constraint to the jewellery_item table
ALTER TABLE cart_item
    ADD CONSTRAINT fk_cart_item_jewellery
        FOREIGN KEY (jewellery_id) REFERENCES jewellery_item(jewellery_id)
            ON DELETE CASCADE;

-- 4. Update the unique constraint
-- Previously (V1) it was UNIQUE KEY uq_cart_listing (cart_id, listing_id).
-- We drop it and replace it with a more flexible logic if needed,
-- or leave it to allow multiple different jewelry items.
