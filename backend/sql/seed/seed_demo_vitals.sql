-- ============================================================================
-- Seed Demo Vital Signs Data
-- ============================================================================
-- Description: Generates initial demo vital signs data for patient 1
--              Creates 10 minutes of data (600 records, 1 per second)
--              with realistic varying values for demo purposes
-- 
-- This replaces the need to run: python scripts/generate_demo_vitals.py
-- Note: For continuous real-time updates during demo, still use the Python script
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Generate 10 minutes of demo vitals for Patient 1
-- ----------------------------------------------------------------------------
-- Creates 600 records (1 per second for 10 minutes)
-- Values vary realistically within normal ranges

DELIMITER $$

DROP PROCEDURE IF EXISTS generate_demo_vitals$$

CREATE PROCEDURE generate_demo_vitals()
BEGIN
    DECLARE v_counter INT DEFAULT 0;
    DECLARE v_patient_id BIGINT UNSIGNED DEFAULT 1;
    DECLARE v_device_id INT UNSIGNED DEFAULT 1;
    DECLARE v_start_time DATETIME(6);
    DECLARE v_heart_rate INT DEFAULT 75;
    DECLARE v_spo2 INT DEFAULT 98;
    DECLARE v_bp_sys INT DEFAULT 120;
    DECLARE v_bp_dia INT DEFAULT 75;
    DECLARE v_temp DECIMAL(4,2) DEFAULT 36.8;
    DECLARE v_resp INT DEFAULT 16;
    
    -- Start from 10 minutes ago
    SET v_start_time = DATE_SUB(NOW(6), INTERVAL 10 MINUTE);
    
    WHILE v_counter < 600 DO
        -- Simulate realistic variation (random walk)
        SET v_heart_rate = GREATEST(60, LEAST(100, v_heart_rate + FLOOR(RAND() * 5) - 2));
        SET v_spo2 = GREATEST(95, LEAST(100, v_spo2 + FLOOR(RAND() * 3) - 1));
        SET v_bp_sys = GREATEST(110, LEAST(130, v_bp_sys + FLOOR(RAND() * 5) - 2));
        SET v_bp_dia = GREATEST(65, LEAST(85, v_bp_dia + FLOOR(RAND() * 3) - 1));
        SET v_temp = GREATEST(36.5, LEAST(37.2, v_temp + (RAND() * 0.2) - 0.1));
        SET v_resp = GREATEST(14, LEAST(20, v_resp + FLOOR(RAND() * 3) - 1));
        
        INSERT INTO vitals (
            patient_id, 
            device_id, 
            ts, 
            heart_rate, 
            spo2, 
            bp_systolic, 
            bp_diastolic, 
            temperature_c, 
            respiration
        )
        VALUES (
            v_patient_id,
            v_device_id,
            DATE_ADD(v_start_time, INTERVAL v_counter SECOND),
            v_heart_rate,
            v_spo2,
            v_bp_sys,
            v_bp_dia,
            ROUND(v_temp, 2),
            v_resp
        );
        
        SET v_counter = v_counter + 1;
    END WHILE;
END$$

DELIMITER ;

-- Execute the procedure to generate demo vitals
CALL generate_demo_vitals();

-- Clean up the temporary procedure
DROP PROCEDURE IF EXISTS generate_demo_vitals;

-- Note: This generates historical data (last 10 minutes)
-- For real-time continuous updates during demo, use the Python script:
-- docker-compose exec -d backend python /app/scripts/generate_demo_vitals.py

