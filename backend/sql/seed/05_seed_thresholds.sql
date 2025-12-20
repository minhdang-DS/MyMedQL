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

INSERT INTO thresholds (name, type, min_value, max_value) VALUES
    ('heart_rate', 'warning', 60, 100),      -- Warning if HR < 60 or > 100
    ('heart_rate', 'danger', 40, 120),       -- Danger if HR < 40 or > 120
    ('spo2', 'warning', 94, 100),            -- Warning if SpO2 < 94%
    ('spo2', 'danger', 90, 100),              -- Danger if SpO2 < 90%
    ('temperature_c', 'warning', 36.0, 37.5), -- Warning if temp < 36.0°C or > 37.5°C
    ('temperature_c', 'danger', 35.0, 38.5),  -- Danger if temp < 35.0°C or > 38.5°C
    ('bp_systolic', 'warning', 90, 140),      -- Warning if systolic BP < 90 or > 140
    ('bp_systolic', 'danger', 80, 160),       -- Danger if systolic BP < 80 or > 160
    ('bp_diastolic', 'warning', 60, 90),      -- Warning if diastolic BP < 60 or > 90
    ('bp_diastolic', 'danger', 50, 100),      -- Danger if diastolic BP < 50 or > 100
    ('respiration', 'warning', 12, 20),       -- Warning if respiration < 12 or > 20
    ('respiration', 'danger', 10, 30)         -- Danger if respiration < 10 or > 30
ON DUPLICATE KEY UPDATE
    type = VALUES(type),
    min_value = VALUES(min_value),
    max_value = VALUES(max_value);

