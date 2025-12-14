const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/v1/staff/me
 * Get current authenticated user profile
 */
router.get('/me', authMiddleware, authController.getStaffProfile);

module.exports = router;

