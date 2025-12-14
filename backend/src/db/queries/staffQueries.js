/**
 * Staff-related database queries
 */

const db = require('../connection');

/**
 * Get staff by email
 */
async function getStaffByEmail(email) {
  const sql = 'SELECT * FROM staff WHERE email = ?';
  return db.queryOne(sql, [email]);
}

/**
 * Get staff by ID
 */
async function getStaffById(staffId) {
  const sql = 'SELECT * FROM staff WHERE staff_id = ?';
  return db.queryOne(sql, [staffId]);
}

/**
 * Create new staff member
 */
async function createStaff(staffData) {
  const sql = `
    INSERT INTO staff (name, email, password_hash, role, metadata)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    staffData.name,
    staffData.email,
    staffData.password_hash,
    staffData.role || 'viewer',
    staffData.metadata ? JSON.stringify(staffData.metadata) : null,
  ];
  
  const result = await db.query(sql, params);
  return result.insertId;
}

module.exports = {
  getStaffByEmail,
  getStaffById,
  createStaff,
};

