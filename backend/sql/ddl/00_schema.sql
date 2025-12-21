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
-- Set timezone to Vietnam (GMT+7)
SET GLOBAL time_zone = '+07:00';
SET SESSION time_zone = '+07:00';
-- Note: In production, tune SQL_MODE and other settings appropriately.

-- ============================================================================
-- Simulation Config Table (for tracking simulation start time)
-- ============================================================================
CREATE TABLE IF NOT EXISTS simulation_config (
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT DEFAULT NULL,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    status ENUM('admitted', 'discharged', 'transferred', 'unknown', 'verified') NOT NULL DEFAULT 'admitted',
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
    INDEX idx_assign_device_from (device_id, assigned_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Thresholds Table
-- ----------------------------------------------------------------------------
-- Stores thresholds for vital signs monitoring and alert generation.
-- Type: 'warning' or 'critical' - determines alert type
-- These thresholds are used to check patient vitals and create alerts.
CREATE TABLE IF NOT EXISTS thresholds (
    threshold_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,                  -- e.g., 'heart_rate', 'spo2', 'temperature_c', 'bp_systolic'
    type ENUM('warning', 'critical') NOT NULL,  -- Alert type: warning or critical
    min_value DOUBLE DEFAULT NULL,             -- Minimum acceptable value (NULL if no minimum)
    max_value DOUBLE DEFAULT NULL,             -- Maximum acceptable value (NULL if no maximum)
    unit VARCHAR(32) DEFAULT NULL,
    patient_id BIGINT UNSIGNED DEFAULT NULL,    -- NULL => global threshold, otherwise patient-specific
    created_by INT UNSIGNED DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (threshold_id),
    CONSTRAINT fk_thresholds_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(patient_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_thresholds_staff 
        FOREIGN KEY (created_by) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    UNIQUE KEY uk_thresholds_name_type_patient (name, type, patient_id),
    INDEX idx_thresholds_name (name),
    INDEX idx_thresholds_type (type),
    INDEX idx_thresholds_patient_name (patient_id, name)
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
-- Staff-Patient Assignments Table
-- ----------------------------------------------------------------------------
-- Junction table for many-to-many relationship between staff and patients.
-- Tracks which staff members are assigned to monitor which patients.
-- One staff member can monitor many patients, and one patient can be monitored by many staff members.
CREATE TABLE IF NOT EXISTS staff_patients (
    assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id INT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    assigned_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    assigned_by INT UNSIGNED DEFAULT NULL,  -- Staff member who made the assignment
    notes VARCHAR(512) DEFAULT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (assignment_id),
    CONSTRAINT fk_staff_patients_staff 
        FOREIGN KEY (staff_id) 
        REFERENCES staff(staff_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_staff_patients_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(patient_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_staff_patients_assigned_by 
        FOREIGN KEY (assigned_by) 
        REFERENCES staff(staff_id) 
        ON DELETE SET NULL,
    UNIQUE KEY uq_staff_patient (staff_id, patient_id),  -- Prevent duplicate assignments
    INDEX idx_staff_patients_staff (staff_id),
    INDEX idx_staff_patients_patient (patient_id),
    INDEX idx_staff_patients_assigned_at (assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Alerts Table
-- ----------------------------------------------------------------------------
-- Stores alerts generated when vital signs breach predefined thresholds.
-- Created automatically via trigger when vitals are inserted.
CREATE TABLE IF NOT EXISTS alerts (
    alert_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    patient_id BIGINT UNSIGNED NOT NULL,
    alert_type ENUM('warning', 'critical', 'emergency') NOT NULL,
    message TEXT NOT NULL,
    threshold VARCHAR(64) DEFAULT NULL,  -- Name of threshold that was exceeded (e.g., 'heart_rate', 'spo2')
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    acknowledged_at DATETIME(6) DEFAULT NULL,
    PRIMARY KEY (alert_id),
    CONSTRAINT fk_alerts_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(patient_id) 
        ON DELETE CASCADE,
    INDEX idx_alerts_patient_created (patient_id, created_at),
    INDEX idx_alerts_created_at (created_at),
    INDEX idx_alerts_type (alert_type),
    INDEX idx_alerts_threshold (threshold)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

