const bcrypt = require('bcrypt');
const authService = require('../../src/services/authService');

// Mock database queries
jest.mock('../../src/db/queries/staffQueries', () => ({
  getStaffByEmail: jest.fn(),
  getStaffById: jest.fn(),
}));

const staffQueries = require('../../src/db/queries/staffQueries');

describe('Auth Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    test('Auth 1: Password hash is not plaintext and bcrypt.compare returns true', async () => {
      const plainPassword = 'testPassword123';
      const hash = await authService.hashPassword(plainPassword);
      
      // Hash should not be the plaintext
      expect(hash).not.toBe(plainPassword);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
      
      // bcrypt.compare should return true for correct password
      const isValid = await authService.comparePassword(plainPassword, hash);
      expect(isValid).toBe(true);
      
      // bcrypt.compare should return false for incorrect password
      const isInvalid = await authService.comparePassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Login', () => {
    test('Auth 2: Login with invalid credentials returns error', async () => {
      // Mock: Staff not found
      staffQueries.getStaffByEmail.mockResolvedValue(null);
      
      await expect(authService.login('nonexistent@example.com', 'password'))
        .rejects.toThrow('Invalid credentials');
      
      // Mock: Staff found but wrong password
      const mockStaff = {
        staff_id: 1,
        email: 'test@example.com',
        password_hash: await bcrypt.hash('correctPassword', 10),
        role: 'doctor',
      };
      staffQueries.getStaffByEmail.mockResolvedValue(mockStaff);
      
      await expect(authService.login('test@example.com', 'wrongPassword'))
        .rejects.toThrow('Invalid credentials');
    });

    test('Login with valid credentials returns staff and token', async () => {
      const plainPassword = 'correctPassword';
      const mockStaff = {
        staff_id: 1,
        email: 'test@example.com',
        password_hash: await bcrypt.hash(plainPassword, 10),
        role: 'doctor',
        name: 'Test Doctor',
      };
      
      staffQueries.getStaffByEmail.mockResolvedValue(mockStaff);
      
      const result = await authService.login('test@example.com', plainPassword);
      
      expect(result).toHaveProperty('staff');
      expect(result).toHaveProperty('token');
      expect(result.staff).not.toHaveProperty('password_hash');
      expect(result.staff.email).toBe('test@example.com');
      expect(result.staff.role).toBe('doctor');
    });
  });

  describe('Token Generation', () => {
    test('Generate token and verify it', () => {
      const staff = {
        staff_id: 1,
        email: 'test@example.com',
        role: 'doctor',
      };
      
      const token = authService.generateToken(staff);
      expect(token).toBeTruthy();
      
      const decoded = authService.verifyToken(token);
      expect(decoded.staff_id).toBe(staff.staff_id);
      expect(decoded.email).toBe(staff.email);
      expect(decoded.role).toBe(staff.role);
    });

    test('Verify invalid token throws error', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow();
    });
  });
});

