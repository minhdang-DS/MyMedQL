const authService = require('../../services/authService');

/**
 * Login controller
 * POST /api/v1/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await authService.login(email, password);
    
    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 * GET /api/v1/staff/me
 */
async function getStaffProfile(req, res, next) {
  try {
    const staff = await authService.getStaffProfile(req.user.staff_id);
    res.json(staff);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getStaffProfile,
};

