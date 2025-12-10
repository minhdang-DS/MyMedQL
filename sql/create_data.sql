-- ============================================================================
-- MyMedQL Database Schema DDL (MySQL 8.x)
-- ============================================================================
-- Description: Complete database schema for real-time patient vital monitoring
--              and anomaly detection system with triggers, stored procedures,
--              and views for high-frequency data ingestion.
-- 
-- Run as a single script. Adjust partition ranges as your demo timeline requires.
-- ============================================================================
DROP DATABASE IF EXISTS `MyMedQL`;
CREATE DATABASE IF NOT EXISTS `MyMedQL` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `MyMedQL`;

-- ============================================================================
-- 1) Basic Settings
-- ============================================================================
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER';
-- Note: In production, tune SQL_MODE and other settings appropriately.

-- ============================================================================
-- 2) Core Tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Patients Table
-- ----------------------------------------------------------------------------
-- Stores patient demographic information and encrypted medical history.
-- Medical history should be encrypted at the application layer before storage.
CREATE TABLE IF NOT EXISTS patients (
    patient_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE DEFAULT NULL,
    gender ENUM('male', 'female', 'other', 'unknown') DEFAULT 'unknown',
    contact_info JSON DEFAULT NULL,              -- Phone, emergency contacts, etc.
    medical_history VARBINARY(8192) DEFAULT NULL, -- Encrypted bytes; encrypt in app before storing
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (patient_id),
    INDEX idx_patients_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Staff Table
-- ----------------------------------------------------------------------------
-- Stores healthcare staff information with role-based access control.
-- Passwords must be hashed using bcrypt in the application layer (60 chars).
CREATE TABLE IF NOT EXISTS staff (
    staff_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash CHAR(60) NOT NULL,            -- bcrypt hashes typically 60 chars; hashed in application
    role ENUM('admin', 'doctor', 'nurse', 'viewer') NOT NULL DEFAULT 'viewer',
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (staff_id),
    INDEX idx_staff_email (email),
    INDEX idx_staff_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Devices Table
-- ----------------------------------------------------------------------------
-- Stores medical device information with unique serial numbers for tracking.
CREATE TABLE IF NOT EXISTS devices (
    device_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    device_type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(128) NOT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (device_id),
    UNIQUE KEY uq_device_serial (serial_number),
    INDEX idx_devices_type (device_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Admissions Table
-- ----------------------------------------------------------------------------
-- Tracks patient admission lifecycle (admitted, discharged, transferred).
-- Status is automatically updated via trigger when discharge_time is set.
CREATE TABLE IF NOT EXISTS admissions (
    admission_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    patient_id BIGINT UNSIGNED NOT NULL,
    admitted_at DATETIME(6) NOT NULL,
    discharge_time DATETIME(6) DEFAULT NULL,
    status ENUM('admitted', 'discharged', 'transferred', 'unknown') NOT NULL DEFAULT 'admitted',
    admitted_by INT UNSIGNED DEFAULT NULL,
    discharge_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (admission_id),
    CONSTRAINT fk_admissions_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(patient_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_admissions_staff 
        FOREIGN KEY (admitted_by) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    INDEX idx_admissions_patient (patient_id),
    INDEX idx_admissions_status (status),
    INDEX idx_admissions_admitted_at (admitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Device Assignments Table
-- ----------------------------------------------------------------------------
-- Tracks device-to-patient assignment history over time.
-- Ensures audit trail of which devices were assigned to which patients and when.
CREATE TABLE IF NOT EXISTS device_assignments (
    assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    device_id INT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    assigned_from DATETIME(6) NOT NULL,
    assigned_to DATETIME(6) DEFAULT NULL,       -- NULL means currently assigned
    assigned_by INT UNSIGNED DEFAULT NULL,      -- Staff member who made the assignment
    notes VARCHAR(512) DEFAULT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (assignment_id),
    CONSTRAINT fk_assign_device 
        FOREIGN KEY (device_id) 
        REFERENCES devices(device_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_assign_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(patient_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_assign_staff 
        FOREIGN KEY (assigned_by) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    INDEX idx_assign_patient_from (patient_id, assigned_from),
    INDEX idx_assign_device_from (device_id, assigned_from),
    INDEX idx_assign_active (device_id, assigned_to) -- For finding active assignments
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Thresholds Table
-- ----------------------------------------------------------------------------
-- Stores versioned thresholds for vital signs monitoring.
-- Supports both global (patient_id IS NULL) and patient-specific thresholds.
-- Patient-specific thresholds take precedence over global ones.
CREATE TABLE IF NOT EXISTS thresholds (
    threshold_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,                  -- e.g., 'heart_rate', 'spo2', 'temperature_c', 'bp_systolic'
    min_value DOUBLE DEFAULT NULL,
    max_value DOUBLE DEFAULT NULL,
    unit VARCHAR(32) DEFAULT NULL,
    patient_id BIGINT UNSIGNED DEFAULT NULL,    -- NULL => global threshold, otherwise patient-specific
    effective_from DATETIME(6) NOT NULL DEFAULT '1970-01-01 00:00:00',
    effective_to DATETIME(6) DEFAULT NULL,      -- NULL means currently effective
    created_by INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    notes TEXT DEFAULT NULL,
    PRIMARY KEY (threshold_id),
    CONSTRAINT fk_thresholds_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(patient_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_thresholds_staff 
        FOREIGN KEY (created_by) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    INDEX idx_thresholds_name (name),
    INDEX idx_thresholds_patient_name (patient_id, name),
    INDEX idx_thresholds_effective (name, effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Vitals Table
-- ----------------------------------------------------------------------------
-- Time-series table designed for high-frequency insert rates.
-- Uses DATETIME(6) to preserve sub-second precision for real-time monitoring.
-- Partitioned by month for performance optimization.
--
-- NOTE: Foreign key constraints are NOT used on this table because MySQL does not
--       support foreign keys on partitioned tables. Referential integrity is
--       maintained through:
--       1. Application-level validation
--       2. Trigger trg_vitals_validate_admission (ensures patient has active admission)
--       3. Application logic should validate patient_id and device_id exist
CREATE TABLE IF NOT EXISTS vitals (
    vitals_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    patient_id BIGINT UNSIGNED NOT NULL,        -- References patients.patient_id (enforced by application/triggers)
    device_id INT UNSIGNED DEFAULT NULL,        -- References devices.device_id (enforced by application)
    ts DATETIME(6) NOT NULL,
    
    -- Vital sign measurements
    heart_rate INT DEFAULT NULL,                -- Beats per minute
    spo2 INT DEFAULT NULL,                      -- Oxygen saturation percentage
    bp_systolic INT DEFAULT NULL,               -- Systolic blood pressure (mmHg)
    bp_diastolic INT DEFAULT NULL,             -- Diastolic blood pressure (mmHg)
    temperature_c DECIMAL(4, 2) DEFAULT NULL,   -- Temperature in Celsius
    respiration INT DEFAULT NULL,               -- Respirations per minute
    
    metadata JSON DEFAULT NULL,                 -- Additional device-specific metadata
    
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    PRIMARY KEY (vitals_id, ts),
    INDEX idx_vitals_patient_ts (patient_id, ts),
    INDEX idx_vitals_device_ts (device_id, ts),
    INDEX idx_vitals_ts (ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(ts)) (
    PARTITION p_202507 VALUES LESS THAN (TO_DAYS('2025-08-01')),
    PARTITION p_202508 VALUES LESS THAN (TO_DAYS('2025-09-01')),
    PARTITION p_202509 VALUES LESS THAN (TO_DAYS('2025-10-01')),
    PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- ----------------------------------------------------------------------------
-- Alerts Table
-- ----------------------------------------------------------------------------
-- Stores alerts generated when vital signs breach predefined thresholds.
-- Created automatically via trigger when vitals are inserted.
CREATE TABLE IF NOT EXISTS alerts (
    alert_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    patient_id BIGINT UNSIGNED NOT NULL,
    vitals_id BIGINT UNSIGNED DEFAULT NULL,     -- Reference to vitals.vitals_id (no FK due to vitals table partitioning)
    alert_type VARCHAR(64) NOT NULL,            -- e.g., 'threshold_breach', 'device_failure'
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    message TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    resolved_at DATETIME(6) DEFAULT NULL,       -- NULL means unresolved
    created_by INT UNSIGNED DEFAULT NULL,       -- NULL if created by trigger/system
    acknowledged_by INT UNSIGNED DEFAULT NULL,  -- Staff member who acknowledged the alert
    acknowledged_at DATETIME(6) DEFAULT NULL,
    extra JSON DEFAULT NULL,                    -- Additional alert metadata
    PRIMARY KEY (alert_id),
    CONSTRAINT fk_alerts_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(patient_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_alerts_created_by 
        FOREIGN KEY (created_by) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_alerts_ack_by 
        FOREIGN KEY (acknowledged_by) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    INDEX idx_alerts_patient_created (patient_id, created_at),
    INDEX idx_alerts_created_at (created_at),
    INDEX idx_alerts_vitals_id (vitals_id),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_resolved (resolved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Notifications Table
-- ----------------------------------------------------------------------------
-- Stores notifications for WebSocket/push service delivery.
-- Created automatically via trigger when alerts are inserted.
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    alert_id BIGINT UNSIGNED DEFAULT NULL,
    recipient_staff_id INT UNSIGNED DEFAULT NULL, -- Specific staff member recipient
    recipient_role ENUM('admin', 'doctor', 'nurse', 'viewer') DEFAULT NULL, -- Wildcard recipient by role
    payload JSON NOT NULL,                       -- Structured payload for websocket/push delivery
    sent TINYINT(1) NOT NULL DEFAULT 0,          -- 0 = pending, 1 = sent
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    delivered_at DATETIME(6) DEFAULT NULL,
    PRIMARY KEY (notification_id),
    CONSTRAINT fk_notifications_alert 
        FOREIGN KEY (alert_id) 
        REFERENCES alerts(alert_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_staff 
        FOREIGN KEY (recipient_staff_id) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    INDEX idx_notifications_sent (sent),
    INDEX idx_notifications_recipient (recipient_staff_id, recipient_role),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3) Views (Convenience Queries)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Hourly Vitals Averages View
-- ----------------------------------------------------------------------------
-- Provides hourly aggregated averages for all vital signs.
-- Useful for dashboard queries that need quick trend visualization.
CREATE OR REPLACE VIEW vw_hourly_vitals_avg AS
SELECT
    patient_id,
    DATE_FORMAT(ts, '%Y-%m-%d %H:00:00') AS hour_start,
    AVG(heart_rate) AS avg_heart_rate,
    AVG(spo2) AS avg_spo2,
    AVG(bp_systolic) AS avg_bp_systolic,
    AVG(bp_diastolic) AS avg_bp_diastolic,
    AVG(temperature_c) AS avg_temperature_c,
    AVG(respiration) AS avg_respiration,
    COUNT(*) AS reading_count
FROM vitals
GROUP BY patient_id, hour_start;

-- ----------------------------------------------------------------------------
-- Patient Summary View
-- ----------------------------------------------------------------------------
-- Provides a quick overview of each patient including last vital reading
-- timestamp and count of alerts in the last 24 hours.
CREATE OR REPLACE VIEW vw_patient_summary AS
SELECT
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS full_name,
    p.dob,
    p.gender,
    MAX(v.ts) AS last_vital_ts,
    COUNT(DISTINCT v.vitals_id) AS total_vital_readings,
    SUM(
        CASE
            WHEN a.created_at >= NOW() - INTERVAL 24 HOUR THEN 1
            ELSE 0
        END
    ) AS alerts_last_24h,
    SUM(
        CASE
            WHEN a.resolved_at IS NULL THEN 1
            ELSE 0
        END
    ) AS unresolved_alerts
FROM patients p
LEFT JOIN vitals v ON v.patient_id = p.patient_id
LEFT JOIN alerts a ON a.patient_id = p.patient_id
GROUP BY p.patient_id, p.first_name, p.last_name, p.dob, p.gender;

-- ============================================================================
-- 4) Stored Procedures
-- ============================================================================

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

-- ============================================================================
-- 5) Triggers
-- ============================================================================

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

-- ============================================================================
-- 6) Example Data (Optional Seeds)
-- ============================================================================
-- Uncomment and adapt these examples for demo seeding if desired.
-- Note: Password hashes must be generated using bcrypt in your application.

/*
-- Example Staff Records
-- Replace <bcrypt-hash> with actual bcrypt hashes generated in your application
INSERT INTO staff (name, email, password_hash, role) VALUES
    ('Admin User', 'admin@example.com', '<bcrypt-hash>', 'admin'),
    ('Dr. Alice Smith', 'alice@example.com', '<bcrypt-hash>', 'doctor'),
    ('Nurse Bob Johnson', 'bob@example.com', '<bcrypt-hash>', 'nurse'),
    ('Viewer User', 'viewer@example.com', '<bcrypt-hash>', 'viewer');

-- Example Global Thresholds
-- These are standard ICU vital sign ranges; adjust as needed for your use case
INSERT INTO thresholds (name, min_value, max_value, unit, effective_from, created_by)
VALUES
    ('heart_rate', 40, 120, 'bpm', '1970-01-01 00:00:00', 1),
    ('spo2', 88, 100, '%', '1970-01-01 00:00:00', 1),
    ('temperature_c', 35.0, 38.0, 'C', '1970-01-01 00:00:00', 1),
    ('bp_systolic', 80, 140, 'mmHg', '1970-01-01 00:00:00', 1),
    ('bp_diastolic', 50, 90, 'mmHg', '1970-01-01 00:00:00', 1),
    ('respiration', 10, 30, 'breaths/min', '1970-01-01 00:00:00', 1);
*/

-- ============================================================================
-- 7) Operational Notes & Security Reminders
-- ============================================================================
/*
IMPORTANT: The following are application-level responsibilities and best practices.

1) Password Hashing (bcrypt)
   - Perform bcrypt hashing in your application layer (e.g., bcrypt library in Python/Node.js).
   - Store the resulting hash in staff.password_hash (CHAR(60)).
   - Do NOT attempt to compute bcrypt hashes in MySQL.

2) Encryption of Sensitive Fields (medical_history)
   - Prefer encrypting at the application layer using a KMS or environment-held key.
   - If using MySQL AES_ENCRYPT/AES_DECRYPT, keep the key out of the database and rotate keys regularly.
   - Column medical_history is VARBINARY to store encrypted bytes.

3) Role-Based Access Control (RBAC)
   - RBAC should be implemented in the backend: verify staff.role and restrict endpoints accordingly.
   - You may create database users with limited privileges for reporting-only tasks.

4) Partition Maintenance & Foreign Key Limitation
   - The vitals table is partitioned for performance, but MySQL does NOT support foreign keys
     on partitioned tables (Error 1506).
   - Foreign key constraints have been removed from the vitals table to allow partitioning.
   - Referential integrity is maintained through:
     * Application-level validation (validate patient_id and device_id exist before insert)
     * Trigger trg_vitals_validate_admission (ensures patient has active admission)
     * Application logic should validate foreign key relationships
   - Partition maintenance: Create monthly partitions ahead of time.
   - Use ALTER TABLE ... REORGANIZE PARTITION or ADD PARTITION to add new months.
   - Monitor partition sizes and ensure proper maintenance for partitions that grow too large.

5) Alert Deduplication / Flood Control
   - The trigger inserts an alert for every breaching vitals row. In production, consider:
     * De-duplication logic (coalesce frequent identical alerts)
     * Rate-limiting (only one alert per patient per vital per X minutes)
     * Additional stored procedures for alert aggregation

6) Monitoring & Backups
   - Running high insert rates requires tuning InnoDB (innodb_buffer_pool_size, log file sizes).
   - Set up regular backups and test restores to ensure data recovery procedures work.

7) Performance at Demo Scale
   - For the demo target (50 inserts/sec), this schema should perform well with proper indexes and partitions.
   - If you need much higher throughput, consider a dedicated time-series DB (TimescaleDB) or Kafka + OLTP pipeline.

8) Extensibility
   - If you want to add new vitals columns later, update trigger logic and add indexes as needed.
   - Consider using a more generic vitals storage approach (key-value pairs) if you need frequent schema changes.

9) Device Assignment Validation
   - The trigger trg_device_assignments_close_previous ensures devices are only assigned to one patient at a time.
   - Consider adding application-level validation to prevent overlapping assignments.

10) Admission Validation
    - The trigger trg_vitals_validate_admission ensures vitals can only be recorded for admitted patients.
    - This maintains data integrity but may need adjustment if you want to record vitals for discharged patients.
*/

-- ============================================================================
-- End of Schema Script
-- ============================================================================
