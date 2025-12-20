-- ============================================================================
-- MyMedQL Stored Procedures
-- ============================================================================
-- Description: Stored procedures for common database operations.
-- 
-- Run this file after schema.sql to create all stored procedures.
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Get Last N Readings Procedure
-- ----------------------------------------------------------------------------
-- Retrieves the most recent N vital sign readings for a specific patient.
-- Automatically clamps the count between 1 and 1000 for safety.
DELIMITER $$

DROP PROCEDURE IF EXISTS get_last_n_readings$$

CREATE PROCEDURE get_last_n_readings(
    IN in_patient_id BIGINT UNSIGNED,
    IN in_n INT UNSIGNED
)
BEGIN
    DECLARE limit_n INT UNSIGNED;
    
    -- Clamp n between 1 and 1000 to prevent excessive result sets
    SET limit_n = LEAST(GREATEST(in_n, 1), 1000);
    
    SELECT 
        vitals_id,
        patient_id,
        device_id,
        ts,
        heart_rate,
        spo2,
        bp_systolic,
        bp_diastolic,
        temperature_c,
        respiration,
        metadata,
        created_at
    FROM vitals
    WHERE patient_id = in_patient_id
    ORDER BY ts DESC
    LIMIT limit_n;
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- Aggregate Daily Stats Procedure
-- ----------------------------------------------------------------------------
-- Computes daily statistics (min, max, avg) for all vital signs
-- for a specific patient on a given date.
DELIMITER $$

DROP PROCEDURE IF EXISTS aggregate_daily_stats$$

CREATE PROCEDURE aggregate_daily_stats(
    IN in_patient_id BIGINT UNSIGNED,
    IN in_date DATE
)
BEGIN
    SELECT
        DATE(in_date) AS day,
        COUNT(*) AS reading_count,
        -- Heart rate statistics
        AVG(heart_rate) AS avg_heart_rate,
        MIN(heart_rate) AS min_heart_rate,
        MAX(heart_rate) AS max_heart_rate,
        -- SpO2 statistics
        AVG(spo2) AS avg_spo2,
        MIN(spo2) AS min_spo2,
        MAX(spo2) AS max_spo2,
        -- Temperature statistics
        AVG(temperature_c) AS avg_temperature_c,
        MIN(temperature_c) AS min_temperature_c,
        MAX(temperature_c) AS max_temperature_c,
        -- Blood pressure statistics
        AVG(bp_systolic) AS avg_bp_systolic,
        MIN(bp_systolic) AS min_bp_systolic,
        MAX(bp_systolic) AS max_bp_systolic,
        AVG(bp_diastolic) AS avg_bp_diastolic,
        MIN(bp_diastolic) AS min_bp_diastolic,
        MAX(bp_diastolic) AS max_bp_diastolic,
        -- Respiration statistics
        AVG(respiration) AS avg_respiration,
        MIN(respiration) AS min_respiration,
        MAX(respiration) AS max_respiration
    FROM vitals
    WHERE patient_id = in_patient_id
        AND DATE(ts) = in_date;
END$$

DELIMITER ;
