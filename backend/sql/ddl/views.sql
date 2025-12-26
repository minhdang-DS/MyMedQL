-- ============================================================================
-- MyMedQL Views
-- ============================================================================
-- Description: Convenience views for common queries and aggregations.
-- 
-- Run this file after schema.sql to create all views.
-- ============================================================================

USE `mymedql`;

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
-- Provides a consolidated patient summary for the main patient list dashboard.
-- Designed for fast read performance with one row per patient.
--
-- Data Exposed:
-- 1. Patient Demographics: patient_id, full_name, gender
-- 2. Vital Readings Statistics: total count, last reading timestamp
-- 3. Alerts Summary: count in last 24h, unresolved (active) count
--
-- Usage Notes:
-- - For recent vital readings (last N): Call stored procedure get_last_n_readings(patient_id, N)
--   Example: CALL get_last_n_readings(1, 50) -- Fetch last 50 readings for patient 1
--
-- - For daily aggregated vitals: Call stored procedure aggregate_daily_stats(patient_id, date)
--   Example: CALL aggregate_daily_stats(1, CURDATE()) -- Daily stats for patient 1 today
--
-- These stored procedures should be called from the application layer to support
-- dynamic parameters (N readings, specific dates) as SQL views cannot accept parameters.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_patient_summary AS
SELECT
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS full_name,
    p.gender,
    p.room_id,
    -- Vital readings statistics
    COALESCE(vital_stats.total_vital_readings, 0) AS total_vital_readings,
    vital_stats.last_vital_ts,
    -- Most recent vital readings (snapshot for quick reference)
    vital_stats.latest_heart_rate,
    vital_stats.latest_spo2,
    vital_stats.latest_bp_systolic,
    vital_stats.latest_bp_diastolic,
    vital_stats.latest_temperature_c,
    vital_stats.latest_respiration,
    -- Alerts summary
    COALESCE(alert_stats.alerts_last_24h, 0) AS alerts_last_24h,
    COALESCE(alert_stats.unresolved_alerts, 0) AS unresolved_alerts,
    -- Admission status
    admission_info.admission_status,
    admission_info.admitted_at
FROM patients p
-- Subquery for vital statistics (more efficient than joining all vitals)
LEFT JOIN (
    SELECT 
        v1.patient_id,
        COUNT(*) AS total_vital_readings,
        MAX(v1.ts) AS last_vital_ts,
        -- Get latest vital values using a correlated subquery approach
        (SELECT heart_rate FROM vitals v2 
         WHERE v2.patient_id = v1.patient_id 
         ORDER BY v2.ts DESC LIMIT 1) AS latest_heart_rate,
        (SELECT spo2 FROM vitals v2 
         WHERE v2.patient_id = v1.patient_id 
         ORDER BY v2.ts DESC LIMIT 1) AS latest_spo2,
        (SELECT bp_systolic FROM vitals v2 
         WHERE v2.patient_id = v1.patient_id 
         ORDER BY v2.ts DESC LIMIT 1) AS latest_bp_systolic,
        (SELECT bp_diastolic FROM vitals v2 
         WHERE v2.patient_id = v1.patient_id 
         ORDER BY v2.ts DESC LIMIT 1) AS latest_bp_diastolic,
        (SELECT temperature_c FROM vitals v2 
         WHERE v2.patient_id = v1.patient_id 
         ORDER BY v2.ts DESC LIMIT 1) AS latest_temperature_c,
        (SELECT respiration FROM vitals v2 
         WHERE v2.patient_id = v1.patient_id 
         ORDER BY v2.ts DESC LIMIT 1) AS latest_respiration
    FROM vitals v1
    GROUP BY v1.patient_id
) vital_stats ON vital_stats.patient_id = p.patient_id
-- Subquery for alert statistics (separated for performance)
LEFT JOIN (
    SELECT 
        a.patient_id,
        SUM(CASE WHEN a.created_at >= NOW() - INTERVAL 24 HOUR THEN 1 ELSE 0 END) AS alerts_last_24h,
        SUM(CASE WHEN a.acknowledged_at IS NULL THEN 1 ELSE 0 END) AS unresolved_alerts
    FROM alerts a
    GROUP BY a.patient_id
) alert_stats ON alert_stats.patient_id = p.patient_id
-- Subquery for current admission status
LEFT JOIN (
    SELECT 
        adm.patient_id,
        adm.status AS admission_status,
        adm.admitted_at
    FROM admissions adm
    WHERE adm.admission_id = (
        SELECT MAX(adm2.admission_id) 
        FROM admissions adm2 
        WHERE adm2.patient_id = adm.patient_id
    )
) admission_info ON admission_info.patient_id = p.patient_id;
