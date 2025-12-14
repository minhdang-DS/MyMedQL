/**
 * Alert-related database queries
 */

const db = require('../connection');

/**
 * Get unresolved alerts
 */
async function getUnresolvedAlerts(limit = 100) {
  const sql = `
    SELECT a.*, 
           CONCAT(p.first_name, ' ', p.last_name) AS patient_name
    FROM alerts a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.resolved_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT ?
  `;
  return db.query(sql, [limit]);
}

/**
 * Get alerts by patient
 */
async function getAlertsByPatient(patientId, limit = 50) {
  const sql = `
    SELECT * FROM alerts
    WHERE patient_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `;
  return db.query(sql, [patientId, limit]);
}

/**
 * Get alert by ID
 */
async function getAlertById(alertId) {
  const sql = 'SELECT * FROM alerts WHERE alert_id = ?';
  return db.queryOne(sql, [alertId]);
}

/**
 * Acknowledge/resolve an alert
 */
async function acknowledgeAlert(alertId, staffId) {
  const sql = `
    UPDATE alerts
    SET resolved_at = NOW(6),
        acknowledged_by = ?,
        acknowledged_at = NOW(6)
    WHERE alert_id = ? AND resolved_at IS NULL
  `;
  const result = await db.query(sql, [staffId, alertId]);
  return result.affectedRows > 0;
}

/**
 * Get alerts by severity
 */
async function getAlertsBySeverity(severity, limit = 50) {
  const sql = `
    SELECT a.*, 
           CONCAT(p.first_name, ' ', p.last_name) AS patient_name
    FROM alerts a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.severity = ? AND a.resolved_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT ?
  `;
  return db.query(sql, [severity, limit]);
}

module.exports = {
  getUnresolvedAlerts,
  getAlertsByPatient,
  getAlertById,
  acknowledgeAlert,
  getAlertsBySeverity,
};

