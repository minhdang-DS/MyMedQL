const rbacMiddleware = require('../../src/api/middleware/rbacMiddleware');
const { hasPermission } = require('../../src/db/rbac/permissions');

describe('RBAC Middleware - Unit Tests', () => {
  describe('Permission Checks', () => {
    test('RBAC 1: Doctor can perform nurse action', () => {
      const req = {
        user: {
          staff_id: 1,
          email: 'doctor@example.com',
          role: 'doctor',
        },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      const next = jest.fn();
      
      // Doctor should be able to create patients (nurse action)
      const middleware = rbacMiddleware('patients:create');
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('RBAC 2: Viewer cannot perform admin action', () => {
      const req = {
        user: {
          staff_id: 1,
          email: 'viewer@example.com',
          role: 'viewer',
        },
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      const next = jest.fn();
      
      // Viewer should NOT be able to create staff (admin action)
      const middleware = rbacMiddleware('staff:create');
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Insufficient permissions',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('hasPermission function', () => {
    test('Admin has permission for all actions', () => {
      expect(hasPermission('admin', 'patients:create')).toBe(true);
      expect(hasPermission('admin', 'patients:read')).toBe(true);
      expect(hasPermission('admin', 'staff:create')).toBe(true);
    });

    test('Viewer has limited permissions', () => {
      expect(hasPermission('viewer', 'patients:read')).toBe(true);
      expect(hasPermission('viewer', 'alerts:read')).toBe(true);
      expect(hasPermission('viewer', 'patients:create')).toBe(false);
      expect(hasPermission('viewer', 'staff:create')).toBe(false);
    });
  });
});

