-- ============================================================================
-- Seed Admissions Data
-- ============================================================================
-- Description: Creates admission records for patients
--              This runs after staff and patients are created
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Admission Records
-- ----------------------------------------------------------------------------
-- Create admissions for existing patients, using doctor's staff_id

INSERT INTO admissions (patient_id, admitted_at, status, admitted_by, discharge_notes) 
SELECT 
    p.patient_id,
    NOW() - INTERVAL (3 - p.patient_id) DAY,
    'admitted',
    (SELECT staff_id FROM staff WHERE role = 'doctor' LIMIT 1),
    NULL
FROM patients p
WHERE p.patient_id IN (1, 2)
  AND NOT EXISTS (
      SELECT 1 FROM admissions a 
      WHERE a.patient_id = p.patient_id AND a.status = 'admitted'
  );

-- ----------------------------------------------------------------------------
-- Device Assignments
-- ----------------------------------------------------------------------------
-- Assign devices to patients with active admissions
-- Note: Using individual INSERTs to avoid trigger conflicts

SET @nurse_id = (SELECT staff_id FROM staff WHERE role = 'nurse' LIMIT 1);

INSERT INTO device_assignments (device_id, patient_id, assigned_from, assigned_by, notes) 
VALUES 
    (1, 1, NOW() - INTERVAL 2 DAY, @nurse_id, 'Initial device assignment for patient monitoring'),
    (2, 2, NOW() - INTERVAL 1 DAY, @nurse_id, 'Device assigned for continuous monitoring')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

