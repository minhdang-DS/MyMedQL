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
-- IMPORTANT: Admin must have staff_id = 0

-- Step 1: Delete any existing admin with email 'admin@example.com' but different staff_id
-- This ensures we can insert staff_id = 0 without email conflicts
DELETE FROM staff WHERE email = 'admin@example.com' AND staff_id != 0;

-- Step 2: Enable NO_AUTO_VALUE_ON_ZERO mode to allow inserting explicit 0 into AUTO_INCREMENT column
-- This mode allows inserting 0 (or NULL) into AUTO_INCREMENT columns without triggering auto-increment
SET @old_sql_mode = @@sql_mode;
SET sql_mode = CONCAT(@old_sql_mode, ',NO_AUTO_VALUE_ON_ZERO');

-- Step 3: Insert admin with staff_id = 0 (explicit value, will work with sql_mode='')
INSERT INTO staff (staff_id, name, email, password_hash, role, metadata) VALUES
    (0, 'Admin User', 'admin@example.com', '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.', 'admin', 
     JSON_OBJECT('department', 'Administration', 'employee_id', 'ADM001', 'phone', '+1-555-1001', 'office', 'Room 101'))
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    name = VALUES(name),
    role = VALUES(role),
    metadata = VALUES(metadata);

-- Restore sql_mode
SET sql_mode = @old_sql_mode;

-- Step 4: Now that staff_id 0 exists, migrate foreign key references from old admin records
-- Update staff_patients (staff_id reference) - avoid duplicates
UPDATE staff_patients sp
INNER JOIN staff s ON sp.staff_id = s.staff_id
LEFT JOIN staff_patients sp2 ON sp2.staff_id = 0 AND sp2.patient_id = sp.patient_id
SET sp.staff_id = 0
WHERE s.role = 'admin' AND s.staff_id != 0 AND sp2.assignment_id IS NULL;

-- Update staff_patients (assigned_by reference)
UPDATE staff_patients sp
INNER JOIN staff s ON sp.assigned_by = s.staff_id
SET sp.assigned_by = 0
WHERE s.role = 'admin' AND s.staff_id != 0;

-- Update thresholds
UPDATE thresholds t
INNER JOIN staff s ON t.created_by = s.staff_id
SET t.created_by = 0
WHERE s.role = 'admin' AND s.staff_id != 0;

-- Update device_assignments
UPDATE device_assignments da
INNER JOIN staff s ON da.assigned_by = s.staff_id
SET da.assigned_by = 0
WHERE s.role = 'admin' AND s.staff_id != 0;

-- Update admissions
UPDATE admissions a
INNER JOIN staff s ON a.admitted_by = s.staff_id
SET a.admitted_by = 0
WHERE s.role = 'admin' AND s.staff_id != 0;

-- Step 5: Delete old admin records (now safe since foreign keys are migrated)
DELETE FROM staff WHERE role = 'admin' AND staff_id != 0;

-- Step 6: Set AUTO_INCREMENT to start from 1 (so doctors/nurses get IDs >= 1)
SET @max_id = (SELECT COALESCE(MAX(staff_id), 0) FROM staff WHERE staff_id > 0);
SET @next_id = GREATEST(1, COALESCE(@max_id, 0) + 1);
SET @sql = CONCAT('ALTER TABLE staff AUTO_INCREMENT = ', @next_id);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 7: Insert doctor (will get staff_id >= 1)
INSERT INTO staff (name, email, password_hash, role, metadata) VALUES
    ('Dr. Alice Smith', 'doctor@example.com', '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.', 'doctor', 
     JSON_OBJECT('department', 'Cardiology', 'employee_id', 'DOC001', 'license', 'MD12345', 'phone', '+1-555-2001', 'office', 'Room 201', 'specialization', 'Cardiac Care'))
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    name = VALUES(name),
    role = VALUES(role),
    metadata = VALUES(metadata);

-- Step 8: Insert nurse (will get staff_id >= 1)
INSERT INTO staff (name, email, password_hash, role, metadata) VALUES
    ('Nurse Bob Johnson', 'nurse@example.com', '$2b$12$S2prsHz08j7VxIVvtdm78ubBYjL5rxb6VY0fviCoH1rodB3XJtkG.', 'nurse', 
     JSON_OBJECT('department', 'ICU', 'employee_id', 'NUR001', 'certification', 'RN67890', 'phone', '+1-555-3001', 'shift', 'Day', 'years_experience', 8))
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
