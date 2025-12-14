/**
 * Vitals-related database queries
 */

const db = require('../connection');

/**
 * Insert vital signs reading
 * Note: Triggers will automatically create alerts if thresholds are breached
 */
async function insertVitals(vitalsData) {
  const sql = `
    INSERT INTO vitals (
      patient_id, device_id, ts, heart_rate, spo2, 
      bp_systolic, bp_diastolic, temperature_c, respiration, metadata
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    vitalsData.patient_id,
    vitalsData.device_id || null,
    vitalsData.ts || new Date(),
    vitalsData.heart_rate || null,
    vitalsData.spo2 || null,
    vitalsData.bp_systolic || null,
    vitalsData.bp_diastolic || null,
    vitalsData.temperature_c || null,
    vitalsData.respiration || null,
    vitalsData.metadata ? JSON.stringify(vitalsData.metadata) : null,
  ];
  
  const result = await db.query(sql, params);
  return result.insertId;
}

/**
 * Get vitals by patient and time range
 */
async function getVitalsByRange(patientId, startTime, endTime) {
  const sql = `
    SELECT * FROM vitals
    WHERE patient_id = ? AND ts >= ? AND ts <= ?
    ORDER BY ts DESC
  `;
  return db.query(sql, [patientId, startTime, endTime]);
}

/**
 * Get latest vitals for a patient
 */
async function getLatestVitals(patientId) {
  const sql = `
    SELECT * FROM vitals
    WHERE patient_id = ?
    ORDER BY ts DESC
    LIMIT 1
  `;
  return db.queryOne(sql, [patientId]);
}

module.exports = {
  insertVitals,
  getVitalsByRange,
  getLatestVitals,
};

