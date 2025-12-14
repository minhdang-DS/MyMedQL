const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

/**
 * POST /api/v1/devices/:id/assign
 * Assign device to patient
 * Requires: admin, doctor, or nurse role
 */
router.post(
  '/:id/assign',
  authMiddleware,
  rbacMiddleware('devices:assign'),
  deviceController.assignDevice
);

module.exports = router;

