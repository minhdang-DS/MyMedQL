-- ============================================================================
-- MyMedQL Sample Thresholds
-- ============================================================================
-- Description: Sample global thresholds for vital signs monitoring.
-- 
-- These are standard ICU vital sign ranges; adjust as needed for your use case.
-- Run this file after schema.sql to populate default thresholds.
-- 
-- Note: Password hashes must be generated using bcrypt in your application.
--       Replace <bcrypt-hash> with actual bcrypt hashes.
-- ============================================================================

USE `MyMedQL`;

-- ----------------------------------------------------------------------------
-- Example Global Thresholds
-- ----------------------------------------------------------------------------
-- These are standard ICU vital sign ranges; adjust as needed for your use case.
-- Global thresholds (patient_id IS NULL) apply to all patients unless
-- overridden by patient-specific thresholds.

INSERT INTO thresholds (name, min_value, max_value, unit, effective_from, created_by)
VALUES
    ('heart_rate', 40, 120, 'bpm', '1970-01-01 00:00:00', NULL),
    ('spo2', 88, 100, '%', '1970-01-01 00:00:00', NULL),
    ('temperature_c', 35.0, 38.0, 'C', '1970-01-01 00:00:00', NULL),
    ('bp_systolic', 80, 140, 'mmHg', '1970-01-01 00:00:00', NULL),
    ('bp_diastolic', 50, 90, 'mmHg', '1970-01-01 00:00:00', NULL),
    ('respiration', 10, 30, 'breaths/min', '1970-01-01 00:00:00', NULL);

-- Note: If you have staff records, you can set created_by to a valid staff_id.
-- For example: created_by = 1 (assuming staff_id 1 exists)
