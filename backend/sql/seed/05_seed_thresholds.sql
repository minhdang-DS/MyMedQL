-- ============================================================================
-- MyMedQL Sample Thresholds
-- ============================================================================
-- Description: Sample thresholds for vital signs monitoring.
-- 
-- These thresholds are used to check patient vitals and create alerts.
-- Type: 'warning' or 'danger' - determines alert severity
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Global Thresholds
-- ----------------------------------------------------------------------------
-- These thresholds apply to all patients for alert generation

INSERT INTO thresholds (name, type, min_value, max_value, unit, patient_id, created_by, notes) VALUES
    ('heart_rate', 'warning', 60, 100, 'bpm', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Normal heart rate warning range'),
    ('heart_rate', 'critical', 40, 120, 'bpm', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Critical heart rate range'),
    ('spo2', 'warning', 94, 100, '%', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Oxygen saturation warning range'),
    ('spo2', 'critical', 90, 100, '%', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Critical oxygen saturation range'),
    ('temperature_c', 'warning', 36.0, 37.5, '°C', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Body temperature warning range'),
    ('temperature_c', 'critical', 35.0, 38.5, '°C', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Critical body temperature range'),
    ('bp_systolic', 'warning', 90, 140, 'mmHg', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Systolic blood pressure warning range'),
    ('bp_systolic', 'critical', 80, 160, 'mmHg', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Critical systolic blood pressure range'),
    ('bp_diastolic', 'warning', 60, 90, 'mmHg', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Diastolic blood pressure warning range'),
    ('bp_diastolic', 'critical', 50, 100, 'mmHg', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Critical diastolic blood pressure range'),
    ('respiration', 'warning', 12, 20, 'breaths/min', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Respiration rate warning range'),
    ('respiration', 'critical', 10, 30, 'breaths/min', NULL, (SELECT staff_id FROM staff WHERE role = 'admin' LIMIT 1), 'Critical respiration rate range')
ON DUPLICATE KEY UPDATE
    min_value = VALUES(min_value),
    max_value = VALUES(max_value),
    unit = VALUES(unit),
    notes = VALUES(notes),
    created_by = VALUES(created_by);

