/**
 * Role-Based Access Control (RBAC) permissions matrix
 * Defines which roles can perform which actions
 */

const PERMISSIONS = {
  // Patient management
  'patients:create': ['admin', 'doctor', 'nurse'],
  'patients:read': ['admin', 'doctor', 'nurse', 'viewer'],
  'patients:update': ['admin', 'doctor'],
  'patients:delete': ['admin'],
  
  // Device management
  'devices:assign': ['admin', 'doctor', 'nurse'],
  'devices:read': ['admin', 'doctor', 'nurse', 'viewer'],
  
  // Vitals ingestion (public endpoint with API key)
  'vitals:ingest': ['public'], // Special case - uses API key, not role
  
  // Alerts
  'alerts:read': ['admin', 'doctor', 'nurse', 'viewer'],
  'alerts:acknowledge': ['admin', 'doctor', 'nurse'],
  'alerts:resolve': ['admin', 'doctor', 'nurse'],
  
  // Staff management
  'staff:create': ['admin'],
  'staff:read': ['admin', 'doctor', 'nurse', 'viewer'],
  'staff:update': ['admin'],
  'staff:delete': ['admin'],
  
  // Profile
  'profile:read': ['admin', 'doctor', 'nurse', 'viewer'],
};

/**
 * Check if a role has permission for an action
 * @param {string} role - User role (admin, doctor, nurse, viewer)
 * @param {string} action - Action to check (e.g., 'patients:create')
 * @returns {boolean} True if role has permission
 */
function hasPermission(role, action) {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) {
    return false; // Unknown action
  }
  
  if (allowedRoles.includes('public')) {
    return true; // Public action
  }
  
  return allowedRoles.includes(role);
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {Array<string>} List of allowed actions
 */
function getRolePermissions(role) {
  return Object.keys(PERMISSIONS).filter(action => 
    hasPermission(role, action)
  );
}

module.exports = {
  hasPermission,
  getRolePermissions,
  PERMISSIONS,
};

