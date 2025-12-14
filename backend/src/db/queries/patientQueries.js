/**
 * Patient-related database queries
 * All queries use parameterized statements to prevent SQL injection
 */

const db = require('../connection');

/**
 * Create a new patient
 */
async function createPatient(patientData) {
  const sql = `
    INSERT INTO patients (first_name, last_name, dob, gender, contact_info, medical_history)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    patientData.first_name,
    patientData.last_name,
    patientData.dob || null,
    patientData.gender || 'unknown',
    patientData.contact_info ? JSON.stringify(patientData.contact_info) : null,
    patientData.medical_history || null, // Should be encrypted buffer
  ];
  
  const result = await db.query(sql, params);
  return result.insertId;
}

/**
 * Get patient by ID
 */
async function getPatientById(patientId) {
  const sql = 'SELECT * FROM patients WHERE patient_id = ?';
  return db.queryOne(sql, [patientId]);
}

/**
 * Update patient
 */
async function updatePatient(patientId, patientData) {
  const updates = [];
  const params = [];
  
  if (patientData.first_name !== undefined) {
    updates.push('first_name = ?');
    params.push(patientData.first_name);
  }
  if (patientData.last_name !== undefined) {
    updates.push('last_name = ?');
    params.push(patientData.last_name);
  }
  if (patientData.dob !== undefined) {
    updates.push('dob = ?');
    params.push(patientData.dob);
  }
  if (patientData.gender !== undefined) {
    updates.push('gender = ?');
    params.push(patientData.gender);
  }
  if (patientData.contact_info !== undefined) {
    updates.push('contact_info = ?');
    params.push(patientData.contact_info ? JSON.stringify(patientData.contact_info) : null);
  }
  if (patientData.medical_history !== undefined) {
    updates.push('medical_history = ?');
    params.push(patientData.medical_history); // Should be encrypted buffer
  }
  
  if (updates.length === 0) {
    return null;
  }
  
  params.push(patientId);
  const sql = `UPDATE patients SET ${updates.join(', ')} WHERE patient_id = ?`;
  const result = await db.query(sql, params);
  return result.affectedRows > 0;
}

/**
 * Get patient vitals using stored procedure
 */
async function getPatientVitals(patientId, limit = 100) {
  return db.callProcedure('get_last_n_readings', [patientId, limit]);
}

/**
 * Get patient summary (uses view)
 */
async function getPatientSummary(patientId) {
  const sql = 'SELECT * FROM vw_patient_summary WHERE patient_id = ?';
  return db.queryOne(sql, [patientId]);
}

/**
 * Get active admission for patient
 */
async function getActiveAdmission(patientId) {
  const sql = `
    SELECT * FROM admissions 
    WHERE patient_id = ? 
      AND status = 'admitted' 
      AND discharge_time IS NULL
    ORDER BY admitted_at DESC
    LIMIT 1
  `;
  return db.queryOne(sql, [patientId]);
}

module.exports = {
  createPatient,
  getPatientById,
  updatePatient,
  getPatientVitals,
  getPatientSummary,
  getActiveAdmission,
};

