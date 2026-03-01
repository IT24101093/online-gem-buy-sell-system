ALTER TABLE validation_report
    ADD COLUMN detected_gem_type VARCHAR(80) NULL AFTER color_tone,
    ADD COLUMN confidence_score DECIMAL(5,2) NULL AFTER detected_gem_type;