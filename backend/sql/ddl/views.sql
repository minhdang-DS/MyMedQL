-- ============================================================================
-- MyMedQL Views
-- ============================================================================
-- Description: Convenience views for common queries and aggregations.
-- 
-- Run this file after schema.sql to create all views.
-- ============================================================================

USE `MyMedQL`;

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
