const alertQueries = require('../db/queries/alertQueries');

/**
 * Get unresolved alerts
 */
async function getUnresolvedAlerts(limit = 100) {
  return alertQueries.getUnresolvedAlerts(limit);
}

/**
 * Get alerts by patient
 */
async function getAlertsByPatient(patientId, limit = 50) {
  return alertQueries.getAlertsByPatient(patientId, limit);
}

/**
 * Get alert by ID
 */
async function getAlertById(alertId) {
  const alert = await alertQueries.getAlertById(alertId);
  
  if (!alert) {
    throw new Error('Alert not found');
  }
  
  // Parse JSON extra field if present
  if (alert.extra && typeof alert.extra === 'string') {
    try {
      alert.extra = JSON.parse(alert.extra);
    } catch (error) {
      // Keep as string if parsing fails
    }
  }
  
  return alert;
}

/**
 * Acknowledge/resolve an alert
 */
async function acknowledgeAlert(alertId, staffId) {
  const acknowledged = await alertQueries.acknowledgeAlert(alertId, staffId);
  
  if (!acknowledged) {
    throw new Error('Alert not found or already resolved');
  }
  
  return getAlertById(alertId);
}

/**
 * Get alerts by severity
 */
async function getAlertsBySeverity(severity, limit = 50) {
  return alertQueries.getAlertsBySeverity(severity, limit);
}

module.exports = {
  getUnresolvedAlerts,
  getAlertsByPatient,
  getAlertById,
  acknowledgeAlert,
  getAlertsBySeverity,
};

