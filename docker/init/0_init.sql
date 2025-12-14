-- MyMedQL Database Initialization Script
-- This script orchestrates the initialization of the database
-- It ensures proper execution order of all schema and seed files

-- Note: This is a coordinator file. The actual schema files are mounted
-- in /docker-entrypoint-initdb.d/ and executed in alphabetical order:
-- 1. ddl/schema.sql
-- 2. ddl/partitioning.sql
-- 3. ddl/views.sql
-- 4. ddl/stored_procedures.sql
-- 5. ddl/triggers.sql
-- 6. ddl/indexes.sql
-- 7. seed/sample_thresholds.sql
-- 8. seed/sample_data.sql
-- 9. seed/demo_scenarios.sql

-- This file runs first (0_init.sql) to set up the database
CREATE DATABASE IF NOT EXISTS mymedql;
USE mymedql;

-- Set character set
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Log initialization start
SELECT 'MyMedQL database initialization started...' AS message;
SELECT CURRENT_TIMESTAMP AS started_at;

