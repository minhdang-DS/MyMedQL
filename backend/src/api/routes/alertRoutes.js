const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

/**
 * GET /api/v1/alerts/unresolved
 * Get all unresolved alerts
 * Requires: Any authenticated user
 */
router.get(
  '/unresolved',
  authMiddleware,
  rbacMiddleware('alerts:read'),
  alertController.getUnresolvedAlerts
);

/**
 * GET /api/v1/alerts/:id
 * Get alert by ID
 * Requires: Any authenticated user
 */
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('alerts:read'),
  alertController.getAlert
);

/**
 * POST /api/v1/alerts/:id/acknowledge
 * Acknowledge/resolve an alert
 * Requires: admin, doctor, or nurse role
 */
router.post(
  '/:id/acknowledge',
  authMiddleware,
  rbacMiddleware('alerts:acknowledge'),
  alertController.acknowledgeAlert
);

module.exports = router;

