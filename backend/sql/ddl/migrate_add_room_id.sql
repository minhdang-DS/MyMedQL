-- ============================================================================
-- Migration: Add room_id column to patients table
-- ============================================================================
-- Description: Adds room_id column to existing patients table and updates
--              existing patients with room assignments.
-- ============================================================================

USE `mymedql`;

-- Add room_id column (will fail silently if column already exists)
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- This should be run manually or with error handling
ALTER TABLE patients 
ADD COLUMN room_id VARCHAR(50) DEFAULT NULL AFTER contact_info;

-- Add index on room_id (will fail if index already exists)
CREATE INDEX idx_patients_room ON patients(room_id);

-- Update existing patients with room assignments
UPDATE patients 
SET room_id = CASE 
    WHEN patient_id = 1 THEN '201-A'
    WHEN patient_id = 2 THEN '305-ICU'
    WHEN patient_id = 3 THEN '210-B'
    WHEN patient_id = 4 THEN '404-A'
    ELSE CONCAT('Room-', patient_id)
END
WHERE room_id IS NULL;

