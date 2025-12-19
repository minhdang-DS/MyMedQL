-- ============================================================================
-- MyMedQL Database Schema DDL (MySQL 8.x)
-- ============================================================================
-- Description: Core database schema for real-time patient vital monitoring
--              and anomaly detection system.
-- 
-- This file contains the database creation and all table definitions.
-- Run this file first before other DDL files.
-- ============================================================================

DROP DATABASE IF EXISTS `mymedql`;
CREATE DATABASE IF NOT EXISTS `mymedql` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mymedql`;

-- ============================================================================
-- Basic Settings
-- ============================================================================
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,ERROR_FOR_DIVISION_BY_ZERO';
-- Note: In production, tune SQL_MODE and other settings appropriately.

-- ============================================================================
-- Core Tables
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
    password_hash CHAR(60) DEFAULT NULL,         -- bcrypt hash for patient login
    room_id VARCHAR(50) DEFAULT NULL,            -- Room identifier (e.g., "201-A", "305-ICU")
    medical_history VARBINARY(8192) DEFAULT NULL, -- Encrypted bytes; encrypt in app before storing
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (patient_id),
    INDEX idx_patients_name (last_name, first_name),
    INDEX idx_patients_room (room_id)
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
-- Stores thresholds for vital signs monitoring and alert generation.
-- Type: 'warning' or 'danger' - determines alert severity
-- These thresholds are used to check patient vitals and create alerts.
CREATE TABLE IF NOT EXISTS thresholds (
    threshold_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,                  -- e.g., 'heart_rate', 'spo2', 'temperature_c', 'bp_systolic'
    type ENUM('warning', 'danger') NOT NULL,   -- Alert type: warning or danger
    min_value DOUBLE DEFAULT NULL,             -- Minimum acceptable value (NULL if no minimum)
    max_value DOUBLE DEFAULT NULL,             -- Maximum acceptable value (NULL if no maximum)
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (threshold_id),
    UNIQUE KEY uk_thresholds_name_type (name, type),  -- Unique constraint on (name, type) combination
    INDEX idx_thresholds_name (name),
    INDEX idx_thresholds_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Vitals Table
-- ----------------------------------------------------------------------------
-- Time-series table designed for high-frequency insert rates.
-- Uses DATETIME(6) to preserve sub-second precision for real-time monitoring.
-- Partitioned by month for performance optimization (see partitioning.sql).
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Partitioning is applied separately in partitioning.sql
-- This allows the schema to be created first, then partitioned

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
