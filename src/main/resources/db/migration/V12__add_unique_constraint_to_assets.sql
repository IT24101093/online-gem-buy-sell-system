-- 1. Clean up the duplicates so the constraint doesn't fail
DELETE FROM corporate_assets WHERE name = 'Cash at Bank';

-- 2. Add the strict rule to the database
ALTER TABLE corporate_assets ADD CONSTRAINT uc_asset_name UNIQUE (name);

-- 3. Re-insert your single, combined starting point
INSERT INTO corporate_assets (name, category, value_lkr)
VALUES ('Cash at Bank', 'CURRENT', 31000.00);