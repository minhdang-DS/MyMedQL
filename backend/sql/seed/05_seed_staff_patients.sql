-- ============================================================================
-- Seed Staff-Patient Assignments
-- ============================================================================
-- Description: Assigns patients to staff members for monitoring.
--              IMPORTANT:
--              - Admin (staff_id = 0) is assigned to ALL patients
--              - Doctors and nurses can be assigned to multiple patients (overlapping with admin)
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
-- IMPORTANT: 
-- - Admin (staff_id = 0) is assigned to ALL patients
-- - Doctors and nurses can be assigned to multiple patients (overlapping with admin)

-- Get staff IDs (admin must be 0)
SET @admin_id = 0;  -- Admin is always staff_id = 0
SET @doctor_id = (SELECT staff_id FROM staff WHERE role = 'doctor' AND staff_id != 0 LIMIT 1);
SET @nurse_id = (SELECT staff_id FROM staff WHERE role = 'nurse' AND staff_id != 0 LIMIT 1);

-- Assign ALL patients to Admin (staff_id = 0)
-- This ensures admin can see all patients
INSERT INTO staff_patients (staff_id, patient_id, assigned_by, notes)
SELECT 
    @admin_id,
    p.patient_id,
    @admin_id,
    CONCAT('Assigned to admin for monitoring - Patient ', p.patient_id, ' - Administrative oversight')
FROM patients p
INNER JOIN admissions a ON p.patient_id = a.patient_id
WHERE a.status IN ('verified', 'admitted')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

-- Assign patients to Doctor (multiple patients, overlaps with admin)
-- Doctor gets 6 patients (or all if less than 6)
INSERT INTO staff_patients (staff_id, patient_id, assigned_by, notes)
SELECT 
    @doctor_id,
    p.patient_id,
    @admin_id,  -- Assigned by admin
    CONCAT('Assigned to doctor for medical supervision - Patient ', p.patient_id, ' - Clinical care')
FROM patients p
INNER JOIN admissions a ON p.patient_id = a.patient_id
WHERE a.status IN ('verified', 'admitted')
ORDER BY p.patient_id
LIMIT 6
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

-- Assign patients to Nurse (multiple patients, overlaps with admin and doctor)
-- Nurse gets 6 patients (or all if less than 6), with some overlap
INSERT INTO staff_patients (staff_id, patient_id, assigned_by, notes)
SELECT 
    @nurse_id,
    p.patient_id,
    @admin_id,  -- Assigned by admin
    CONCAT('Assigned to nurse for direct care - Patient ', p.patient_id, ' - Nursing care')
FROM patients p
INNER JOIN admissions a ON p.patient_id = a.patient_id
WHERE a.status IN ('verified', 'admitted')
ORDER BY p.patient_id
LIMIT 6
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

-- Note: The ON DUPLICATE KEY UPDATE ensures this script is idempotent
--       and can be run multiple times safely.

