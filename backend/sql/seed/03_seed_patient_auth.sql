-- ============================================================================
-- Seed Patient Authentication Data
-- ============================================================================
-- Description: Sets bcrypt password hashes for patients 1-5
--              Password for all patients: password123
-- 
-- This replaces the need to run: python scripts/seed_patient_auth.py
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Patient Passwords
-- ----------------------------------------------------------------------------
-- Password: password123
-- Bcrypt hash generated with: passlib.context.CryptContext (bcrypt, rounds=12)
-- Hash: $2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.

-- Update passwords for patients 1-5
-- This is safe to run multiple times (idempotent)
UPDATE patients 
SET password_hash = '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.'
WHERE patient_id BETWEEN 1 AND 5
  AND patient_id IN (SELECT patient_id FROM (SELECT patient_id FROM patients WHERE patient_id BETWEEN 1 AND 5) AS p);

-- Note: If patients 1-5 don't exist yet, this will simply update 0 rows
-- The patients should be created by sample_data.sql first

