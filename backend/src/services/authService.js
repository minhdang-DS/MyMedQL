const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const staffQueries = require('../db/queries/staffQueries');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token for a staff member
 * @param {Object} staff - Staff object with staff_id, email, role
 * @returns {string} JWT token
 */
function generateToken(staff) {
  const payload = {
    staff_id: staff.staff_id,
    email: staff.email,
    role: staff.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Authenticate staff member
 * @param {string} email - Staff email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} Staff object and JWT token
 */
async function login(email, password) {
  const staff = await staffQueries.getStaffByEmail(email);
  
  if (!staff) {
    throw new Error('Invalid credentials');
  }
  
  const isPasswordValid = await comparePassword(password, staff.password_hash);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Remove password hash from response
  const { password_hash, ...staffWithoutPassword } = staff;
  
  const token = generateToken(staff);
  
  return {
    staff: staffWithoutPassword,
    token,
  };
}

/**
 * Get staff profile by ID
 * @param {number} staffId - Staff ID
 * @returns {Promise<Object>} Staff object without password
 */
async function getStaffProfile(staffId) {
  const staff = await staffQueries.getStaffById(staffId);
  
  if (!staff) {
    throw new Error('Staff not found');
  }
  
  const { password_hash, ...staffWithoutPassword } = staff;
  return staffWithoutPassword;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  login,
  getStaffProfile,
};

