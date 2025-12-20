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
-- Trigger: Auto-Close Previous Device Assignments
-- ----------------------------------------------------------------------------
-- When a new device assignment is created, automatically closes any previous
-- active assignment for the same device (sets assigned_to to the new assignment's
-- assigned_from time) to ensure a device is only assigned to one patient at a time.
DROP TRIGGER IF EXISTS trg_device_assignments_close_previous;
DELIMITER $$
CREATE TRIGGER trg_device_assignments_close_previous
BEFORE INSERT ON device_assignments
FOR EACH ROW
BEGIN
    DECLARE v_previous_assignment_id BIGINT UNSIGNED;
    
    -- Find the most recent active assignment for this device (where assigned_to IS NULL)
    -- Note: NEW.assignment_id doesn't exist in table yet during BEFORE INSERT, so no need to exclude it
    SELECT assignment_id
    INTO v_previous_assignment_id
    FROM device_assignments
    WHERE device_id = NEW.device_id
        AND assigned_to IS NULL
    ORDER BY assigned_from DESC
    LIMIT 1;
    
    -- If an active assignment exists, close it by setting assigned_to to the new assignment's start time
    IF v_previous_assignment_id IS NOT NULL THEN
        UPDATE device_assignments
        SET assigned_to = NEW.assigned_from
        WHERE assignment_id = v_previous_assignment_id;
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
    
    -- Check if patient has an active admission
    SELECT COUNT(*)
    INTO v_admission_count
    FROM admissions
    WHERE patient_id = NEW.patient_id
        AND status = 'admitted'
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
--   - Severity is computed heuristically based on how far the value is from the threshold range
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
    DECLARE v_threshold_id BIGINT UNSIGNED;
    DECLARE v_severity ENUM('low', 'medium', 'high', 'critical');
    DECLARE v_message TEXT;
    DECLARE v_patient BIGINT UNSIGNED;
    DECLARE v_vitalsid BIGINT UNSIGNED;
    
    SET v_patient = NEW.patient_id;
    SET v_vitalsid = NEW.vitals_id;
    
    -- ========================================================================
    -- Check Heart Rate
    -- ========================================================================
    IF NEW.heart_rate IS NOT NULL THEN
        SET v_name = 'heart_rate';
        SET v_value = NEW.heart_rate;
        
        -- Find the most specific applicable threshold (patient-specific first, then global)
        SELECT min_value, max_value, threshold_id
        INTO v_min, v_max, v_threshold_id
        FROM thresholds
        WHERE name = v_name
            AND (patient_id = v_patient OR patient_id IS NULL)
            AND NEW.ts >= effective_from
            AND (effective_to IS NULL OR NEW.ts <= effective_to)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        -- Check if value breaches threshold
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            -- Calculate severity based on distance from threshold range
            IF v_min IS NOT NULL AND v_max IS NOT NULL THEN
                -- Distance from nearest boundary normalized by range width
                SET @range = GREATEST(ABS(v_max - v_min), 1e-6);
                SET @dist = LEAST(ABS(v_value - v_min), ABS(v_value - v_max));
                IF @dist / @range >= 0.5 THEN
                    SET v_severity = 'critical';
                ELSEIF @dist / @range >= 0.2 THEN
                    SET v_severity = 'high';
                ELSE
                    SET v_severity = 'medium';
                END IF;
            ELSE
                -- Single-sided threshold defaults to high severity
                SET v_severity = 'high';
            END IF;
            
            -- Build alert message
            SET v_message = CONCAT(
                'Threshold breach for ', v_name, 
                ': value=', v_value,
                IF(v_min IS NOT NULL, CONCAT(', min=', v_min), ''),
                IF(v_max IS NOT NULL, CONCAT(', max=', v_max), ''),
                IF(v_threshold_id IS NOT NULL, CONCAT(' (threshold_id=', v_threshold_id, ')'), '')
            );
            
            -- Insert alert record
            INSERT INTO alerts(patient_id, vitals_id, alert_type, severity, message, created_at, extra, created_by)
            VALUES (
                v_patient, 
                v_vitalsid, 
                'threshold_breach', 
                v_severity, 
                v_message, 
                NOW(6),
                JSON_OBJECT('vital', v_name, 'value', v_value, 'threshold_id', IFNULL(v_threshold_id, 0)), 
                NULL
            );
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check SpO2 (Oxygen Saturation)
    -- ========================================================================
    IF NEW.spo2 IS NOT NULL THEN
        SET v_name = 'spo2';
        SET v_value = NEW.spo2;
        
        SELECT min_value, max_value, threshold_id
        INTO v_min, v_max, v_threshold_id
        FROM thresholds
        WHERE name = v_name
            AND (patient_id = v_patient OR patient_id IS NULL)
            AND NEW.ts >= effective_from
            AND (effective_to IS NULL OR NEW.ts <= effective_to)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            IF v_min IS NOT NULL AND v_max IS NOT NULL THEN
                SET @range = GREATEST(ABS(v_max - v_min), 1e-6);
                SET @dist = LEAST(ABS(v_value - v_min), ABS(v_value - v_max));
                IF @dist / @range >= 0.5 THEN
                    SET v_severity = 'critical';
                ELSEIF @dist / @range >= 0.2 THEN
                    SET v_severity = 'high';
                ELSE
                    SET v_severity = 'medium';
                END IF;
            ELSE
                SET v_severity = 'high';
            END IF;
            
            SET v_message = CONCAT(
                'Threshold breach for ', v_name, 
                ': value=', v_value,
                IF(v_min IS NOT NULL, CONCAT(', min=', v_min), ''),
                IF(v_max IS NOT NULL, CONCAT(', max=', v_max), '')
            );
            
            INSERT INTO alerts(patient_id, vitals_id, alert_type, severity, message, created_at, extra, created_by)
            VALUES (
                v_patient, 
                v_vitalsid, 
                'threshold_breach', 
                v_severity, 
                v_message, 
                NOW(6),
                JSON_OBJECT('vital', v_name, 'value', v_value, 'threshold_id', IFNULL(v_threshold_id, 0)), 
                NULL
            );
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Systolic Blood Pressure
    -- ========================================================================
    IF NEW.bp_systolic IS NOT NULL THEN
        SET v_name = 'bp_systolic';
        SET v_value = NEW.bp_systolic;
        
        SELECT min_value, max_value, threshold_id
        INTO v_min, v_max, v_threshold_id
        FROM thresholds
        WHERE name = v_name
            AND (patient_id = v_patient OR patient_id IS NULL)
            AND NEW.ts >= effective_from
            AND (effective_to IS NULL OR NEW.ts <= effective_to)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            IF v_min IS NOT NULL AND v_max IS NOT NULL THEN
                SET @range = GREATEST(ABS(v_max - v_min), 1e-6);
                SET @dist = LEAST(ABS(v_value - v_min), ABS(v_value - v_max));
                IF @dist / @range >= 0.5 THEN
                    SET v_severity = 'critical';
                ELSEIF @dist / @range >= 0.2 THEN
                    SET v_severity = 'high';
                ELSE
                    SET v_severity = 'medium';
                END IF;
            ELSE
                SET v_severity = 'high';
            END IF;
            
            SET v_message = CONCAT('Threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, vitals_id, alert_type, severity, message, created_at, extra, created_by)
            VALUES (
                v_patient, 
                v_vitalsid, 
                'threshold_breach', 
                v_severity, 
                v_message, 
                NOW(6),
                JSON_OBJECT('vital', v_name, 'value', v_value, 'threshold_id', IFNULL(v_threshold_id, 0)), 
                NULL
            );
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Diastolic Blood Pressure
    -- ========================================================================
    IF NEW.bp_diastolic IS NOT NULL THEN
        SET v_name = 'bp_diastolic';
        SET v_value = NEW.bp_diastolic;
        
        SELECT min_value, max_value, threshold_id
        INTO v_min, v_max, v_threshold_id
        FROM thresholds
        WHERE name = v_name
            AND (patient_id = v_patient OR patient_id IS NULL)
            AND NEW.ts >= effective_from
            AND (effective_to IS NULL OR NEW.ts <= effective_to)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            IF v_min IS NOT NULL AND v_max IS NOT NULL THEN
                SET @range = GREATEST(ABS(v_max - v_min), 1e-6);
                SET @dist = LEAST(ABS(v_value - v_min), ABS(v_value - v_max));
                IF @dist / @range >= 0.5 THEN
                    SET v_severity = 'critical';
                ELSEIF @dist / @range >= 0.2 THEN
                    SET v_severity = 'high';
                ELSE
                    SET v_severity = 'medium';
                END IF;
            ELSE
                SET v_severity = 'high';
            END IF;
            
            SET v_message = CONCAT('Threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, vitals_id, alert_type, severity, message, created_at, extra, created_by)
            VALUES (
                v_patient, 
                v_vitalsid, 
                'threshold_breach', 
                v_severity, 
                v_message, 
                NOW(6),
                JSON_OBJECT('vital', v_name, 'value', v_value, 'threshold_id', IFNULL(v_threshold_id, 0)), 
                NULL
            );
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Temperature
    -- ========================================================================
    IF NEW.temperature_c IS NOT NULL THEN
        SET v_name = 'temperature_c';
        SET v_value = NEW.temperature_c;
        
        SELECT min_value, max_value, threshold_id
        INTO v_min, v_max, v_threshold_id
        FROM thresholds
        WHERE name = v_name
            AND (patient_id = v_patient OR patient_id IS NULL)
            AND NEW.ts >= effective_from
            AND (effective_to IS NULL OR NEW.ts <= effective_to)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            IF v_min IS NOT NULL AND v_max IS NOT NULL THEN
                SET @range = GREATEST(ABS(v_max - v_min), 1e-6);
                SET @dist = LEAST(ABS(v_value - v_min), ABS(v_value - v_max));
                IF @dist / @range >= 0.5 THEN
                    SET v_severity = 'critical';
                ELSEIF @dist / @range >= 0.2 THEN
                    SET v_severity = 'high';
                ELSE
                    SET v_severity = 'medium';
                END IF;
            ELSE
                SET v_severity = 'high';
            END IF;
            
            SET v_message = CONCAT('Threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, vitals_id, alert_type, severity, message, created_at, extra, created_by)
            VALUES (
                v_patient, 
                v_vitalsid, 
                'threshold_breach', 
                v_severity, 
                v_message, 
                NOW(6),
                JSON_OBJECT('vital', v_name, 'value', v_value, 'threshold_id', IFNULL(v_threshold_id, 0)), 
                NULL
            );
        END IF;
    END IF;
    
    -- ========================================================================
    -- Check Respiration Rate
    -- ========================================================================
    IF NEW.respiration IS NOT NULL THEN
        SET v_name = 'respiration';
        SET v_value = NEW.respiration;
        
        SELECT min_value, max_value, threshold_id
        INTO v_min, v_max, v_threshold_id
        FROM thresholds
        WHERE name = v_name
            AND (patient_id = v_patient OR patient_id IS NULL)
            AND NEW.ts >= effective_from
            AND (effective_to IS NULL OR NEW.ts <= effective_to)
        ORDER BY (patient_id IS NOT NULL) DESC
        LIMIT 1;
        
        IF (v_min IS NOT NULL AND v_value < v_min) OR (v_max IS NOT NULL AND v_value > v_max) THEN
            IF v_min IS NOT NULL AND v_max IS NOT NULL THEN
                SET @range = GREATEST(ABS(v_max - v_min), 1e-6);
                SET @dist = LEAST(ABS(v_value - v_min), ABS(v_value - v_max));
                IF @dist / @range >= 0.5 THEN
                    SET v_severity = 'critical';
                ELSEIF @dist / @range >= 0.2 THEN
                    SET v_severity = 'high';
                ELSE
                    SET v_severity = 'medium';
                END IF;
            ELSE
                SET v_severity = 'high';
            END IF;
            
            SET v_message = CONCAT('Threshold breach for ', v_name, ': value=', v_value);
            
            INSERT INTO alerts(patient_id, vitals_id, alert_type, severity, message, created_at, extra, created_by)
            VALUES (
                v_patient, 
                v_vitalsid, 
                'threshold_breach', 
                v_severity, 
                v_message, 
                NOW(6),
                JSON_OBJECT('vital', v_name, 'value', v_value, 'threshold_id', IFNULL(v_threshold_id, 0)), 
                NULL
            );
        END IF;
    END IF;
END$$
DELIMITER ;

-- ----------------------------------------------------------------------------
-- Trigger: Auto-Create Notification from Alert
-- ----------------------------------------------------------------------------
-- Automatically creates a notification record when an alert is inserted.
-- The notification payload is structured for WebSocket/push service delivery.
-- Notifications are marked as unsent (sent=0) and picked up by a background daemon.
DROP TRIGGER IF EXISTS trg_alert_to_notification;
DELIMITER $$
CREATE TRIGGER trg_alert_to_notification
AFTER INSERT ON alerts
FOR EACH ROW
BEGIN
    -- Create a notification row to be picked up by push/websocket daemon
    INSERT INTO notifications(alert_id, payload, sent, created_at)
    VALUES (
        NEW.alert_id,
        JSON_OBJECT(
            'alert_id', NEW.alert_id,
            'patient_id', NEW.patient_id,
            'vitals_id', NEW.vitals_id,
            'alert_type', NEW.alert_type,
            'severity', NEW.severity,
            'message', NEW.message,
            'created_at', DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s.%f'),
            'extra', NEW.extra
        ),
        0,  -- Mark as unsent; daemon will update this
        NOW(6)
    );
END$$
DELIMITER ;
