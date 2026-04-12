/* ============================================================
   V9__apply_payment_component_changes.sql
   Safely applies the Payment Owner's required columns to the 
   existing payment_transaction table without breaking V1.
   ============================================================ */

-- 1. Add the new financial columns the payment component needs
ALTER TABLE payment_transaction
    ADD COLUMN addons_lkr DECIMAL(14,2) DEFAULT 0 AFTER subtotal_lkr,
    ADD COLUMN shipping_lkr DECIMAL(14,2) DEFAULT 0 AFTER addons_lkr,
    ADD COLUMN gateway_reference VARCHAR(100) NULL AFTER status;

-- 2. Change method and status from ENUM to VARCHAR(20) to match their code
ALTER TABLE payment_transaction
    MODIFY COLUMN method VARCHAR(20) NOT NULL,
    MODIFY COLUMN status VARCHAR(20) NOT NULL;

-- Note: We are keeping all the other original columns (gateway_txn_id, 
-- card_brand, receipt_url, etc.) in case they are needed later. 
-- They can just ignore those columns in their backend code.