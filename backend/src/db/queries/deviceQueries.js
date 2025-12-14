/**
 * Device-related database queries
 */

const db = require('../connection');

/**
 * Get device by ID
 */
async function getDeviceById(deviceId) {
  const sql = 'SELECT * FROM devices WHERE device_id = ?';
  return db.queryOne(sql, [deviceId]);
}

/**
 * Get device by serial number
 */
async function getDeviceBySerial(serialNumber) {
  const sql = 'SELECT * FROM devices WHERE serial_number = ?';
  return db.queryOne(sql, [serialNumber]);
}

/**
 * Assign device to patient
 */
async function assignDevice(deviceId, patientId, assignedBy, notes = null) {
  const sql = `
    INSERT INTO device_assignments (device_id, patient_id, assigned_from, assigned_by, notes)
    VALUES (?, ?, NOW(6), ?, ?)
  `;
  const params = [deviceId, patientId, assignedBy, notes];
  const result = await db.query(sql, params);
  return result.insertId;
}

/**
 * Get active device assignment for a device
 */
async function getActiveAssignment(deviceId) {
  const sql = `
    SELECT * FROM device_assignments
    WHERE device_id = ? AND assigned_to IS NULL
    ORDER BY assigned_from DESC
    LIMIT 1
  `;
  return db.queryOne(sql, [deviceId]);
}

/**
 * Get active device assignment for a patient
 */
async function getActiveAssignmentByPatient(patientId) {
  const sql = `
    SELECT da.*, d.device_type, d.serial_number
    FROM device_assignments da
    JOIN devices d ON da.device_id = d.device_id
    WHERE da.patient_id = ? AND da.assigned_to IS NULL
    ORDER BY da.assigned_from DESC
    LIMIT 1
  `;
  return db.queryOne(sql, [patientId]);
}

module.exports = {
  getDeviceById,
  getDeviceBySerial,
  assignDevice,
  getActiveAssignment,
  getActiveAssignmentByPatient,
};

