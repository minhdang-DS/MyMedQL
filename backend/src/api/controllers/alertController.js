const alertService = require('../../services/alertService');

/**
 * Get unresolved alerts
 * GET /api/v1/alerts/unresolved
 */
async function getUnresolvedAlerts(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const alerts = await alertService.getUnresolvedAlerts(limit);
    
    res.json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Acknowledge an alert
 * POST /api/v1/alerts/:id/acknowledge
 */
async function acknowledgeAlert(req, res, next) {
  try {
    const alertId = parseInt(req.params.id);
    const alert = await alertService.acknowledgeAlert(alertId, req.user.staff_id);
    
    res.json({
      message: 'Alert acknowledged successfully',
      alert,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get alert by ID
 * GET /api/v1/alerts/:id
 */
async function getAlert(req, res, next) {
  try {
    const alertId = parseInt(req.params.id);
    const alert = await alertService.getAlertById(alertId);
    res.json(alert);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUnresolvedAlerts,
  acknowledgeAlert,
  getAlert,
};

