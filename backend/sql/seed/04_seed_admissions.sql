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
    NOW() - INTERVAL (p.patient_id % 8 + 1) DAY,
    'verified',
    (SELECT staff_id FROM staff WHERE role = 'doctor' AND staff_id != 0 LIMIT 1),
    CASE 
        WHEN p.patient_id = 1 THEN 'Patient admitted for routine monitoring'
        WHEN p.patient_id = 2 THEN 'Post-surgical observation'
        WHEN p.patient_id = 3 THEN 'ICU care for critical condition'
        WHEN p.patient_id = 4 THEN 'Recovery from procedure'
        WHEN p.patient_id = 5 THEN 'Chronic condition management'
        WHEN p.patient_id = 6 THEN 'Emergency admission'
        WHEN p.patient_id = 7 THEN 'Scheduled admission for treatment'
        WHEN p.patient_id = 8 THEN 'Observation and monitoring'
        WHEN p.patient_id = 9 THEN 'General check-up and vitals monitoring'
        WHEN p.patient_id = 10 THEN 'Post-operative recovery monitoring'
        ELSE 'Standard admission'
    END
FROM patients p
WHERE NOT EXISTS (
      SELECT 1 FROM admissions a 
      WHERE a.patient_id = p.patient_id AND a.status = 'verified'
  );

-- ----------------------------------------------------------------------------
-- Device Assignments
-- ----------------------------------------------------------------------------
-- Assign devices to patients with active admissions
-- Fill all columns: device_id, patient_id, assigned_from, assigned_by, notes

SET @nurse_id = (SELECT staff_id FROM staff WHERE role = 'nurse' AND staff_id != 0 LIMIT 1);
SET @doctor_id = (SELECT staff_id FROM staff WHERE role = 'doctor' AND staff_id != 0 LIMIT 1);
SET @admin_id = 0;  -- Admin is always staff_id = 0

INSERT INTO device_assignments (device_id, patient_id, assigned_from, assigned_by, notes) 
VALUES 
    (1, 1, NOW() - INTERVAL 7 DAY, @nurse_id, 'Initial device assignment for patient monitoring - Vital Signs Monitor VSM-001'),
    (2, 2, NOW() - INTERVAL 6 DAY, @nurse_id, 'Device assigned for continuous monitoring - Vital Signs Monitor VSM-002'),
    (3, 3, NOW() - INTERVAL 5 DAY, @doctor_id, 'ICU device assignment - Vital Signs Monitor VSM-003 for critical patient'),
    (4, 4, NOW() - INTERVAL 4 DAY, @nurse_id, 'Pulse oximeter assigned for oxygen saturation monitoring - POX-001'),
    (5, 5, NOW() - INTERVAL 3 DAY, @nurse_id, 'Blood pressure monitor assigned - BPM-001 for hypertension monitoring'),
    (6, 6, NOW() - INTERVAL 2 DAY, @doctor_id, 'Emergency device assignment - Vital Signs Monitor VSM-004'),
    (7, 7, NOW() - INTERVAL 1 DAY, @nurse_id, 'Pulse oximeter POX-002 assigned for respiratory monitoring'),
    (8, 8, NOW() - INTERVAL 0 DAY, @admin_id, 'Blood pressure monitor BPM-002 assigned for routine monitoring'),
    (1, 9, NOW() - INTERVAL 1 DAY, @nurse_id, 'Vital Signs Monitor VSM-001 assigned for patient 9 monitoring'),
    (2, 10, NOW() - INTERVAL 1 DAY, @nurse_id, 'Vital Signs Monitor VSM-002 assigned for patient 10 monitoring')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

