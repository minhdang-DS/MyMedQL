-- ============================================================================
-- Migration: Add password_hash column to patients table
-- ============================================================================
-- Description: Adds password_hash column if it doesn't exist
--              This is a safe migration that can be run multiple times
-- 
-- This replaces the need to run: python scripts/update_schema_patient_auth.py
-- ============================================================================

USE `mymedql`;

-- Add password_hash column if it doesn't exist
-- Note: The column is already defined in schema.sql, but this migration
-- ensures it exists even if schema.sql wasn't run or was modified

SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'mymedql' 
      AND TABLE_NAME = 'patients' 
      AND COLUMN_NAME = 'password_hash'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE patients ADD COLUMN password_hash CHAR(60) DEFAULT NULL AFTER contact_info',
    'SELECT "Column password_hash already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

