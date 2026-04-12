ALTER TABLE payment_transaction
DROP COLUMN gateway_txn_id,
    DROP COLUMN gateway_ref,        -- <-- Added this line!
    DROP COLUMN idempotency_key,
    DROP COLUMN card_brand,
    DROP COLUMN card_last4,
    DROP COLUMN card_holder_name,
    DROP COLUMN paid_at,
    DROP COLUMN receipt_no,
    DROP COLUMN receipt_pdf_path,
    DROP COLUMN receipt_pdf_url;