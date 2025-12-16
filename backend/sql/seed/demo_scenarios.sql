-- ============================================================================
-- MyMedQL Demo Scenarios
-- ============================================================================
-- Description: Demo scenarios with sample vital sign readings.
-- 
-- Run this file after schema.sql, sample_data.sql, and sample_thresholds.sql
-- to create demo scenarios with vital sign readings that may trigger alerts.
-- 
-- This file demonstrates various scenarios:
--   - Normal vital signs
--   - Threshold breaches (will trigger alerts)
--   - High-frequency readings for performance testing
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Demo Scenario 1: Normal Vital Signs
-- ----------------------------------------------------------------------------
-- Patient 1: Normal readings within thresholds
-- Insert readings every 5 minutes for the last 2 hours (24 readings)

INSERT INTO vitals (patient_id, device_id, ts, heart_rate, spo2, bp_systolic, bp_diastolic, temperature_c, respiration)
SELECT 
    1 AS patient_id,
    1 AS device_id,
    DATE_SUB(NOW(), INTERVAL (120 - (n * 5)) MINUTE) AS ts,
    70 + FLOOR(RAND() * 20) AS heart_rate,      -- Heart rate: 70-90 bpm (normal)
    95 + FLOOR(RAND() * 5) AS spo2,             -- SpO2: 95-100% (normal)
    110 + FLOOR(RAND() * 20) AS bp_systolic,    -- Systolic BP: 110-130 mmHg (normal)
    70 + FLOOR(RAND() * 10) AS bp_diastolic,    -- Diastolic BP: 70-80 mmHg (normal)
    36.5 + (RAND() * 0.5) AS temperature_c,     -- Temperature: 36.5-37.0°C (normal)
    16 + FLOOR(RAND() * 6) AS respiration       -- Respiration: 16-22 breaths/min (normal)
FROM (
    SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION
    SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION
    SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
) AS numbers;

-- ----------------------------------------------------------------------------
-- Demo Scenario 2: Threshold Breach - High Heart Rate
-- ----------------------------------------------------------------------------
-- Patient 2: Elevated heart rate that breaches threshold
-- Insert readings showing gradual increase in heart rate (12 readings over 1 hour)

INSERT INTO vitals (patient_id, device_id, ts, heart_rate, spo2, bp_systolic, bp_diastolic, temperature_c, respiration)
SELECT 
    2 AS patient_id,
    2 AS device_id,
    DATE_SUB(NOW(), INTERVAL (60 - (n * 5)) MINUTE) AS ts,
    100 + (n * 3) AS heart_rate,                -- Gradually increasing: 100-136 bpm (breaches max of 120)
    92 + FLOOR(RAND() * 5) AS spo2,             -- SpO2: 92-97% (slightly low)
    120 + FLOOR(RAND() * 15) AS bp_systolic,    -- Systolic BP: 120-135 mmHg (elevated)
    80 + FLOOR(RAND() * 8) AS bp_diastolic,     -- Diastolic BP: 80-88 mmHg (normal-high)
    37.2 + (RAND() * 0.3) AS temperature_c,     -- Temperature: 37.2-37.5°C (slightly elevated)
    18 + FLOOR(RAND() * 5) AS respiration       -- Respiration: 18-23 breaths/min (normal)
FROM (
    SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
) AS numbers;

-- ----------------------------------------------------------------------------
-- Demo Scenario 3: Critical Threshold Breach - Low SpO2
-- ----------------------------------------------------------------------------
-- Patient 3: Critical low oxygen saturation
-- Insert readings showing dangerously low SpO2 (36 readings over 3 hours)

INSERT INTO vitals (patient_id, device_id, ts, heart_rate, spo2, bp_systolic, bp_diastolic, temperature_c, respiration)
SELECT 
    3 AS patient_id,
    3 AS device_id,
    DATE_SUB(NOW(), INTERVAL (180 - (n * 5)) MINUTE) AS ts,
    95 + FLOOR(RAND() * 15) AS heart_rate,      -- Heart rate: 95-110 bpm (elevated due to low O2)
    GREATEST(75, FLOOR(85 - (n * 0.2))) AS spo2, -- SpO2: Gradually decreasing, critical low (breaches min of 88%)
    100 + FLOOR(RAND() * 20) AS bp_systolic,    -- Systolic BP: 100-120 mmHg (normal)
    65 + FLOOR(RAND() * 10) AS bp_diastolic,     -- Diastolic BP: 65-75 mmHg (normal)
    36.8 + (RAND() * 0.4) AS temperature_c,     -- Temperature: 36.8-37.2°C (normal)
    20 + FLOOR(RAND() * 8) AS respiration       -- Respiration: 20-28 breaths/min (elevated)
FROM (
    SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION
    SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION
    SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION
    SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION
    SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
) AS numbers;

-- ----------------------------------------------------------------------------
-- Demo Scenario 4: High-Frequency Readings (Performance Test)
-- ----------------------------------------------------------------------------
-- Patient 1: High-frequency readings for performance testing
-- Insert readings every 2 seconds for the last 5 minutes (150 readings)
-- Note: Using a stored procedure approach for better performance

DELIMITER $$

DROP PROCEDURE IF EXISTS generate_high_frequency_readings$$

CREATE PROCEDURE generate_high_frequency_readings()
BEGIN
    DECLARE v_counter INT DEFAULT 0;
    DECLARE v_patient_id BIGINT UNSIGNED DEFAULT 1;
    DECLARE v_device_id INT UNSIGNED DEFAULT 1;
    DECLARE v_start_time DATETIME(6);
    
    SET v_start_time = DATE_SUB(NOW(6), INTERVAL 5 MINUTE);
    
    WHILE v_counter < 150 DO
        INSERT INTO vitals (patient_id, device_id, ts, heart_rate, spo2, bp_systolic, bp_diastolic, temperature_c, respiration)
        VALUES (
            v_patient_id,
            v_device_id,
            DATE_ADD(v_start_time, INTERVAL (v_counter * 2) SECOND),
            72 + FLOOR(RAND() * 16),  -- Heart rate: 72-88 bpm (normal)
            96 + FLOOR(RAND() * 4),   -- SpO2: 96-100% (normal)
            115 + FLOOR(RAND() * 15), -- Systolic BP: 115-130 mmHg (normal)
            72 + FLOOR(RAND() * 8),   -- Diastolic BP: 72-80 mmHg (normal)
            36.6 + (RAND() * 0.4),    -- Temperature: 36.6-37.0°C (normal)
            17 + FLOOR(RAND() * 5)    -- Respiration: 17-22 breaths/min (normal)
        );
        SET v_counter = v_counter + 1;
    END WHILE;
END$$

DELIMITER ;

-- Execute the procedure to generate high-frequency readings
CALL generate_high_frequency_readings();

-- Clean up the temporary procedure
DROP PROCEDURE IF EXISTS generate_high_frequency_readings;

-- Note: The triggers will automatically:
--   1. Validate that patients have active admissions
--   2. Check thresholds and create alerts for breaches
--   3. Create notifications for each alert
