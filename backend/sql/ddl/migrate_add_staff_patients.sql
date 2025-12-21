-- ============================================================================
-- Migration: Add Staff-Patient Assignments Table
-- ============================================================================
-- Description: Creates a junction table to support many-to-many relationship
--              between staff and patients for monitoring assignments.
--              One staff member can monitor many patients, and one patient
--              can be monitored by many staff members.
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Staff-Patient Assignments Table
-- ----------------------------------------------------------------------------
-- Junction table for many-to-many relationship between staff and patients.
-- Tracks which staff members are assigned to monitor which patients.
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

