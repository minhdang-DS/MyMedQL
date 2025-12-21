-- ============================================================================
-- Migration: Add threshold column to alerts table
-- ============================================================================
-- Description: Adds a threshold column to store the name of the threshold
--              that was exceeded when the alert was created.
-- 
-- Run this file to add the threshold column to existing databases.
-- ============================================================================

USE `mymedql`;

-- Add threshold column to alerts table
ALTER TABLE alerts 
ADD COLUMN threshold VARCHAR(64) DEFAULT NULL 
COMMENT 'Name of threshold that was exceeded (e.g., heart_rate, spo2)' 
AFTER message;

-- Add index on threshold column for faster queries
CREATE INDEX idx_alerts_threshold ON alerts(threshold);

