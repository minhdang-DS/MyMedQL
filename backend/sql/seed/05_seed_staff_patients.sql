-- ============================================================================
-- Seed Staff-Patient Assignments
-- ============================================================================
-- Description: Assigns 6 patients to each staff member for monitoring.
--              This creates a many-to-many relationship where:
--              - One staff member can monitor many patients
--              - One patient can be monitored by many staff members
-- 
--              This file should run after:
--              - 01_sample_data.sql (creates patients)
--              - 02_seed_staff_auth.sql (creates staff)
--              - migrate_add_staff_patients.sql (creates staff_patients table)
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Staff-Patient Assignments
-- ----------------------------------------------------------------------------
-- Assign 6 patients to each staff member
-- Using a round-robin approach to distribute patients evenly

-- Get staff IDs
SET @admin_id = (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1);
SET @doctor_id = (SELECT staff_id FROM staff WHERE role = 'doctor' LIMIT 1);
SET @nurse_id = (SELECT staff_id FROM staff WHERE role = 'nurse' LIMIT 1);

-- Assign 6 patients to Admin (patients 1-6)
INSERT INTO staff_patients (staff_id, patient_id, assigned_by, notes)
SELECT 
    @admin_id,
    patient_id,
    @admin_id,
    CONCAT('Assigned to admin for monitoring - Patient ', patient_id, ' - Administrative oversight')
FROM patients
WHERE patient_id BETWEEN 1 AND 6
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

-- Assign 6 patients to Doctor (patients 3-8, overlaps with admin on patients 3-6)
INSERT INTO staff_patients (staff_id, patient_id, assigned_by, notes)
SELECT 
    @doctor_id,
    patient_id,
    @doctor_id,
    CONCAT('Assigned to doctor for medical supervision - Patient ', patient_id, ' - Clinical care')
FROM patients
WHERE patient_id BETWEEN 3 AND 8
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

-- Assign 6 patients to Nurse (patients 1-3 and 5-7, overlaps with both admin and doctor)
INSERT INTO staff_patients (staff_id, patient_id, assigned_by, notes)
SELECT 
    @nurse_id,
    patient_id,
    @nurse_id,
    CONCAT('Assigned to nurse for direct care - Patient ', patient_id, ' - Nursing care')
FROM patients
WHERE patient_id IN (1, 2, 3, 5, 6, 7)
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

-- Note: The ON DUPLICATE KEY UPDATE ensures this script is idempotent
--       and can be run multiple times safely.

