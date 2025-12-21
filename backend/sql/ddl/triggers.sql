-- ============================================================================
-- MyMedQL Triggers
-- ============================================================================
-- Description: Database triggers for automatic data validation and processing.
-- 
-- Run this file after schema.sql to create all triggers.
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Trigger: Auto-Update Admission Status on Discharge
-- ----------------------------------------------------------------------------
-- Automatically sets admission status to 'discharged' when discharge_time
-- is set (transitions from NULL to a non-NULL value).
DROP TRIGGER IF EXISTS trg_admissions_discharge_status;
DELIMITER $$
CREATE TRIGGER trg_admissions_discharge_status
BEFORE UPDATE ON admissions
FOR EACH ROW
BEGIN
    -- If discharge_time is set (was previously NULL), mark status as discharged
    IF NEW.discharge_time IS NOT NULL AND OLD.discharge_time IS NULL THEN
        SET NEW.status = 'discharged';
    END IF;
END$$
DELIMITER ;


-- ----------------------------------------------------------------------------
-- Trigger: Validate Vitals for Admitted Patients Only
-- ----------------------------------------------------------------------------
-- Ensures that vitals can only be inserted for patients who have an active
-- admission (status = 'admitted' and discharge_time IS NULL).
-- This maintains data integrity by preventing vitals for discharged patients.
DROP TRIGGER IF EXISTS trg_vitals_validate_admission;
DELIMITER $$
CREATE TRIGGER trg_vitals_validate_admission
BEFORE INSERT ON vitals
FOR EACH ROW
BEGIN
    DECLARE v_admission_count INT UNSIGNED;
    
    -- Check if patient has an active admission (verified or admitted status)
    SELECT COUNT(*)
    INTO v_admission_count
    FROM admissions
    WHERE patient_id = NEW.patient_id
        AND status IN ('admitted', 'verified')
        AND discharge_time IS NULL;
    
    -- If no active admission found, raise an error
    IF v_admission_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot insert vitals: Patient must have an active admission';
    END IF;
END$$
DELIMITER ;

-- ----------------------------------------------------------------------------
-- Trigger: Vitals Threshold Alert Generator
-- ----------------------------------------------------------------------------
-- Automatically creates alerts when vital signs breach predefined thresholds.
-- 
-- Logic:
--   - For each monitored vital column, checks for applicable thresholds
--   - Patient-specific thresholds (patient_id NOT NULL) take precedence over global ones
--   - Critical thresholds are checked first, then warning thresholds
--   - Alert type matches the threshold type (warning/critical)
--   - Each vital is checked independently; multiple alerts can be generated per vitals record
--
-- Note: This trigger is intentionally repetitive for performance reasons.
--       Each vital check is self-contained to minimize trigger complexity.
DROP TRIGGER IF EXISTS trg_vitals_threshold_alert;
DELIMITER $$
CREATE TRIGGER trg_vitals_threshold_alert
AFTER INSERT ON vitals
FOR EACH ROW
BEGIN
    DECLARE v_min DOUBLE;
    DECLARE v_max DOUBLE;
    DECLARE v_name VARCHAR(64);
    DECLARE v_value DOUBLE;
    DECLARE v_threshold_type ENUM('warning', 'critical');
    DECLARE v_message TEXT;
    DECLARE v_patient BIGINT UNSIGNED;
    
    SET v_patient = NEW.patient_id;
    
    -- ========================================================================
    -- Check Heart Rate
    -- ========================================================================
    IF NEW.heart_rate IS NOT NULL THEN
        SET v_name = 'heart_rate';
        SET v_value = NEW.heart_rate;
        
        -- Check critical threshold first (patient-specific then global)
        SELECT min_value, max_value, type
        INTO v_min, v_max, v_threshold_type
        FROM thresholds
        WHERE name = v_name
            AND type = 'critical'
            AND (patient_id = v_patient OR patient_id IS NULL)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        -- If critical threshold breached, create critical alert
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            SET v_message = CONCAT(
                'Critical threshold breach for ', v_name, 
                ': value=', v_value,
                IF(v_min IS NOT NULL, CONCAT(', min=', v_min), ''),
                IF(v_max IS NOT NULL, CONCAT(', max=', v_max), '')
            );
            
            INSERT INTO alerts(patient_id, alert_type, message, created_at)
            VALUES (v_patient, 'critical', v_message, NOW(6));
        ELSE
            -- Check warning threshold (patient-specific then global)
            SELECT min_value, max_value, type
            INTO v_min, v_max, v_threshold_type
            FROM thresholds
            WHERE name = v_name
                AND type = 'warning'
                AND (patient_id = v_patient OR patient_id IS NULL)
            ORDER BY (patient_id IS NOT NULL) DESC
            LIMIT 1;
            
            -- If warning threshold breached, create warning alert
            IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
                SET v_message = CONCAT(
                    'Warning threshold breach for ', v_name, 
                    ': value=', v_value,
                    IF(v_min IS NOT NULL, CONCAT(', min=', v_min), ''),
                    IF(v_max IS NOT NULL, CONCAT(', max=', v_max), '')
                );
                
                INSERT INTO alerts(patient_id, alert_type, message, created_at)
                VALUES (v_patient, 'warning', v_message, NOW(6));
            END IF;
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check SpO2 (Oxygen Saturation)
    -- ========================================================================
    IF NEW.spo2 IS NOT NULL THEN
        SET v_name = 'spo2';
        SET v_value = NEW.spo2;
        
        -- Check critical threshold first (patient-specific then global)
        SELECT min_value, max_value, type
        INTO v_min, v_max, v_threshold_type
        FROM thresholds
        WHERE name = v_name
            AND type = 'critical'
            AND (patient_id = v_patient OR patient_id IS NULL)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        -- If critical threshold breached, create critical alert
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            SET v_message = CONCAT(
                'Critical threshold breach for ', v_name, 
                ': value=', v_value,
                IF(v_min IS NOT NULL, CONCAT(', min=', v_min), ''),
                IF(v_max IS NOT NULL, CONCAT(', max=', v_max), '')
            );
            
            INSERT INTO alerts(patient_id, alert_type, message, created_at)
            VALUES (v_patient, 'critical', v_message, NOW(6));
        ELSE
            -- Check warning threshold (patient-specific then global)
            SELECT min_value, max_value, type
            INTO v_min, v_max, v_threshold_type
            FROM thresholds
            WHERE name = v_name
                AND type = 'warning'
                AND (patient_id = v_patient OR patient_id IS NULL)
            ORDER BY (patient_id IS NOT NULL) DESC
            LIMIT 1;
            
            -- If warning threshold breached, create warning alert
            IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
                SET v_message = CONCAT(
                    'Warning threshold breach for ', v_name, 
                    ': value=', v_value,
                    IF(v_min IS NOT NULL, CONCAT(', min=', v_min), ''),
                    IF(v_max IS NOT NULL, CONCAT(', max=', v_max), '')
                );
                
                INSERT INTO alerts(patient_id, alert_type, message, created_at)
                VALUES (v_patient, 'warning', v_message, NOW(6));
            END IF;
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Systolic Blood Pressure
    -- ========================================================================
    IF NEW.bp_systolic IS NOT NULL THEN
        SET v_name = 'bp_systolic';
        SET v_value = NEW.bp_systolic;
        
        -- Check critical threshold first (patient-specific then global)
        SELECT min_value, max_value, type
        INTO v_min, v_max, v_threshold_type
        FROM thresholds
        WHERE name = v_name
            AND type = 'critical'
            AND (patient_id = v_patient OR patient_id IS NULL)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        -- If critical threshold breached, create critical alert
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            SET v_message = CONCAT('Critical threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, alert_type, message, created_at)
            VALUES (v_patient, 'critical', v_message, NOW(6));
        ELSE
            -- Check warning threshold (patient-specific then global)
            SELECT min_value, max_value, type
            INTO v_min, v_max, v_threshold_type
            FROM thresholds
            WHERE name = v_name
                AND type = 'warning'
                AND (patient_id = v_patient OR patient_id IS NULL)
            ORDER BY (patient_id IS NOT NULL) DESC
            LIMIT 1;
            
            -- If warning threshold breached, create warning alert
            IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
                SET v_message = CONCAT('Warning threshold breach for ', v_name, ': value=', v_value);
            
                INSERT INTO alerts(patient_id, alert_type, message, created_at)
                VALUES (v_patient, 'warning', v_message, NOW(6));
            END IF;
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Diastolic Blood Pressure
    -- ========================================================================
    IF NEW.bp_diastolic IS NOT NULL THEN
        SET v_name = 'bp_diastolic';
        SET v_value = NEW.bp_diastolic;
        
        -- Check critical threshold first (patient-specific then global)
        SELECT min_value, max_value, type
        INTO v_min, v_max, v_threshold_type
        FROM thresholds
        WHERE name = v_name
            AND type = 'critical'
            AND (patient_id = v_patient OR patient_id IS NULL)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        -- If critical threshold breached, create critical alert
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            SET v_message = CONCAT('Critical threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, alert_type, message, created_at)
            VALUES (v_patient, 'critical', v_message, NOW(6));
        ELSE
            -- Check warning threshold (patient-specific then global)
            SELECT min_value, max_value, type
            INTO v_min, v_max, v_threshold_type
            FROM thresholds
            WHERE name = v_name
                AND type = 'warning'
                AND (patient_id = v_patient OR patient_id IS NULL)
            ORDER BY (patient_id IS NOT NULL) DESC
            LIMIT 1;
            
            -- If warning threshold breached, create warning alert
            IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
                SET v_message = CONCAT('Warning threshold breach for ', v_name, ': value=', v_value);
            
                INSERT INTO alerts(patient_id, alert_type, message, created_at)
                VALUES (v_patient, 'warning', v_message, NOW(6));
            END IF;
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Temperature
    -- ========================================================================
    IF NEW.temperature_c IS NOT NULL THEN
        SET v_name = 'temperature_c';
        SET v_value = NEW.temperature_c;
        
        -- Check critical threshold first (patient-specific then global)
        SELECT min_value, max_value, type
        INTO v_min, v_max, v_threshold_type
        FROM thresholds
        WHERE name = v_name
            AND type = 'critical'
            AND (patient_id = v_patient OR patient_id IS NULL)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        -- If critical threshold breached, create critical alert
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            SET v_message = CONCAT('Critical threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, alert_type, message, created_at)
            VALUES (v_patient, 'critical', v_message, NOW(6));
        ELSE
            -- Check warning threshold (patient-specific then global)
            SELECT min_value, max_value, type
            INTO v_min, v_max, v_threshold_type
            FROM thresholds
            WHERE name = v_name
                AND type = 'warning'
                AND (patient_id = v_patient OR patient_id IS NULL)
            ORDER BY (patient_id IS NOT NULL) DESC
            LIMIT 1;
            
            -- If warning threshold breached, create warning alert
            IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
                SET v_message = CONCAT('Warning threshold breach for ', v_name, ': value=', v_value);
            
                INSERT INTO alerts(patient_id, alert_type, message, created_at)
                VALUES (v_patient, 'warning', v_message, NOW(6));
            END IF;
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Respiration Rate
    -- ========================================================================
    IF NEW.respiration IS NOT NULL THEN
        SET v_name = 'respiration';
        SET v_value = NEW.respiration;
        
        -- Check critical threshold first (patient-specific then global)
        SELECT min_value, max_value, type
        INTO v_min, v_max, v_threshold_type
        FROM thresholds
        WHERE name = v_name
            AND type = 'critical'
            AND (patient_id = v_patient OR patient_id IS NULL)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        -- If critical threshold breached, create critical alert
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            SET v_message = CONCAT('Critical threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, alert_type, message, created_at)
            VALUES (v_patient, 'critical', v_message, NOW(6));
        ELSE
            -- Check warning threshold (patient-specific then global)
            SELECT min_value, max_value, type
            INTO v_min, v_max, v_threshold_type
            FROM thresholds
            WHERE name = v_name
                AND type = 'warning'
                AND (patient_id = v_patient OR patient_id IS NULL)
            ORDER BY (patient_id IS NOT NULL) DESC
            LIMIT 1;
            
            -- If warning threshold breached, create warning alert
            IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
                SET v_message = CONCAT('Warning threshold breach for ', v_name, ': value=', v_value);
            
                INSERT INTO alerts(patient_id, alert_type, message, created_at)
                VALUES (v_patient, 'warning', v_message, NOW(6));
            END IF;
        END IF;
    END IF;
END$$
DELIMITER ;

