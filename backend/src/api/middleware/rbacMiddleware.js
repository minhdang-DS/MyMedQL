const { hasPermission } = require('../../db/rbac/permissions');

/**
 * Role-Based Access Control middleware
 * Checks if the authenticated user has permission for the requested action
 * 
 * @param {string} action - Permission action (e.g., 'patients:create')
 * @returns {Function} Express middleware function
 */
function rbacMiddleware(action) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has permission
    if (!hasPermission(req.user.role, action)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: action,
        role: req.user.role,
      });
    }
    
    next();
  };
}

module.exports = rbacMiddleware;

