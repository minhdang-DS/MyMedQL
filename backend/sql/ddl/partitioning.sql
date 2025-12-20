-- ============================================================================
-- MyMedQL Partitioning Configuration
-- ============================================================================
-- Description: Applies partitioning to the vitals table for performance
--              optimization with high-frequency data ingestion.
-- 
-- Run this file after schema.sql to apply partitioning to the vitals table.
-- Adjust partition ranges as your demo timeline requires.
-- ============================================================================

USE `mymedql`;

-- ----------------------------------------------------------------------------
-- Apply Partitioning to Vitals Table
-- ----------------------------------------------------------------------------
-- Partitions the vitals table by month for efficient querying and maintenance.
-- Note: This requires the vitals table to exist (created in schema.sql).
-- 
-- IMPORTANT: Foreign key constraints cannot be used on partitioned tables in MySQL.
-- The vitals table is intentionally designed without FKs for this reason.
-- Referential integrity is maintained through triggers and application logic.

ALTER TABLE vitals
PARTITION BY RANGE (TO_DAYS(ts)) (
    PARTITION p_202507 VALUES LESS THAN (TO_DAYS('2025-08-01')),
    PARTITION p_202508 VALUES LESS THAN (TO_DAYS('2025-09-01')),
    PARTITION p_202509 VALUES LESS THAN (TO_DAYS('2025-10-01')),
    PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- ============================================================================
-- Partition Maintenance Notes
-- ============================================================================
-- To add new partitions in the future, use:
-- 
-- ALTER TABLE vitals REORGANIZE PARTITION p_future INTO (
--     PARTITION p_202510 VALUES LESS THAN (TO_DAYS('2025-11-01')),
--     PARTITION p_future VALUES LESS THAN (MAXVALUE)
-- );
-- 
-- Or add a new partition before p_future:
-- 
-- ALTER TABLE vitals REORGANIZE PARTITION p_future INTO (
--     PARTITION p_202510 VALUES LESS THAN (TO_DAYS('2025-11-01')),
--     PARTITION p_future VALUES LESS THAN (MAXVALUE)
-- );
-- 
-- Monitor partition sizes and ensure proper maintenance for partitions that grow too large.
