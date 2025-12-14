const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/v1/auth/login
 * Public endpoint for staff authentication
 */
router.post('/login', authController.login);

module.exports = router;

