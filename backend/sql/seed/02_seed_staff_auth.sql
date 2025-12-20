-- ============================================================================
-- Seed Staff Authentication Data
-- ============================================================================
-- Description: Creates/updates staff users with bcrypt password hashes
--              Password for all staff: password123
-- 
-- This replaces the need to run: python scripts/seed_staff_auth.py
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Staff Users with Password Hashes
-- ----------------------------------------------------------------------------
-- Password: password123
-- Bcrypt hash generated with: passlib.context.CryptContext (bcrypt, rounds=12)
-- Hash: $2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.

-- Note: Using ON DUPLICATE KEY UPDATE to handle re-runs
-- This ensures passwords are updated even if staff already exists

INSERT INTO staff (name, email, password_hash, role, metadata) VALUES
    ('Admin User', 'admin@example.com', '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.', 'admin', JSON_OBJECT('department', 'Administration'))
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    name = VALUES(name),
    role = VALUES(role),
    metadata = VALUES(metadata);

INSERT INTO staff (name, email, password_hash, role, metadata) VALUES
    ('Dr. Alice Smith', 'doctor@example.com', '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.', 'doctor', JSON_OBJECT('department', 'Cardiology'))
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    name = VALUES(name),
    role = VALUES(role),
    metadata = VALUES(metadata);

INSERT INTO staff (name, email, password_hash, role, metadata) VALUES
    ('Nurse Bob', 'nurse@example.com', '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.', 'nurse', JSON_OBJECT('department', 'ICU'))
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    name = VALUES(name),
    role = VALUES(role),
    metadata = VALUES(metadata);

-- Note: The sample_data.sql may also insert staff with different emails
-- (alice@example.com, bob@example.com). This script ensures the correct
-- emails (doctor@example.com, nurse@example.com) have passwords set.

-- Update existing staff if they were created by sample_data.sql
UPDATE staff 
SET password_hash = '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.'
WHERE email IN ('alice@example.com', 'bob@example.com', 'viewer@example.com')
  AND (password_hash IS NULL OR password_hash = '');

