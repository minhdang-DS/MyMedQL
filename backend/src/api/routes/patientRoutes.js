const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const encryptionMiddleware = require('../middleware/encryptionMiddleware');

/**
 * POST /api/v1/patients
 * Create a new patient
 * Requires: admin, doctor, or nurse role
 */
router.post(
  '/',
  authMiddleware,
  rbacMiddleware('patients:create'),
  encryptionMiddleware,
  patientController.createPatient
);

/**
 * GET /api/v1/patients/:id
 * Get patient details and summary
 * Requires: Any authenticated user
 */
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('patients:read'),
  patientController.getPatient
);

/**
 * GET /api/v1/patients/:id/vitals
 * Get patient vitals using stored procedure
 * Requires: Any authenticated user
 */
router.get(
  '/:id/vitals',
  authMiddleware,
  rbacMiddleware('patients:read'),
  patientController.getPatientVitals
);

/**
 * PUT /api/v1/patients/:id
 * Update patient
 * Requires: admin or doctor role
 */
router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware('patients:update'),
  encryptionMiddleware,
  patientController.updatePatient
);

module.exports = router;

