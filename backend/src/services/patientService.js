const encryption = require('../utils/encryption');
const patientQueries = require('../db/queries/patientQueries');
const deviceQueries = require('../db/queries/deviceQueries');

/**
 * Create a new patient
 * Encrypts medical_history before storing
 */
async function createPatient(patientData) {
  // Encrypt medical_history if provided
  let encryptedHistory = null;
  if (patientData.medical_history) {
    encryptedHistory = encryption.encrypt(patientData.medical_history);
  }
  
  const patientDataWithEncryption = {
    ...patientData,
    medical_history: encryptedHistory,
  };
  
  const patientId = await patientQueries.createPatient(patientDataWithEncryption);
  return getPatientById(patientId);
}

/**
 * Get patient by ID
 * Decrypts medical_history before returning
 */
async function getPatientById(patientId) {
  const patient = await patientQueries.getPatientById(patientId);
  
  if (!patient) {
    throw new Error('Patient not found');
  }
  
  // Decrypt medical_history if present
  if (patient.medical_history) {
    try {
      patient.medical_history = encryption.decrypt(patient.medical_history);
    } catch (error) {
      console.error('Error decrypting medical history:', error);
      patient.medical_history = null;
    }
  }
  
  // Parse JSON fields
  if (patient.contact_info) {
    try {
      patient.contact_info = typeof patient.contact_info === 'string' 
        ? JSON.parse(patient.contact_info) 
        : patient.contact_info;
    } catch (error) {
      console.error('Error parsing contact_info:', error);
    }
  }
  
  return patient;
}

/**
 * Update patient
 * Encrypts medical_history if provided
 */
async function updatePatient(patientId, patientData) {
  // Encrypt medical_history if provided
  if (patientData.medical_history !== undefined) {
    if (patientData.medical_history) {
      patientData.medical_history = encryption.encrypt(patientData.medical_history);
    } else {
      patientData.medical_history = null;
    }
  }
  
  const updated = await patientQueries.updatePatient(patientId, patientData);
  
  if (!updated) {
    throw new Error('Patient not found or no changes made');
  }
  
  return getPatientById(patientId);
}

/**
 * Get patient vitals using stored procedure
 */
async function getPatientVitals(patientId, limit = 100) {
  const vitals = await patientQueries.getPatientVitals(patientId, limit);
  
  // Parse JSON metadata if present
  return vitals.map(vital => {
    if (vital.metadata && typeof vital.metadata === 'string') {
      try {
        vital.metadata = JSON.parse(vital.metadata);
      } catch (error) {
        // Keep as string if parsing fails
      }
    }
    return vital;
  });
}

/**
 * Get patient summary
 */
async function getPatientSummary(patientId) {
  return patientQueries.getPatientSummary(patientId);
}

/**
 * Assign device to patient
 */
async function assignDevice(deviceId, patientId, assignedBy, notes = null) {
  // Verify device exists
  const device = await deviceQueries.getDeviceById(deviceId);
  if (!device) {
    throw new Error('Device not found');
  }
  
  // Verify patient exists
  const patient = await patientQueries.getPatientById(patientId);
  if (!patient) {
    throw new Error('Patient not found');
  }
  
  // Check if patient has active admission
  const admission = await patientQueries.getActiveAdmission(patientId);
  if (!admission) {
    throw new Error('Patient must have an active admission to assign device');
  }
  
  // Assign device (trigger will close previous assignment)
  const assignmentId = await deviceQueries.assignDevice(deviceId, patientId, assignedBy, notes);
  
  return {
    assignment_id: assignmentId,
    device_id: deviceId,
    patient_id: patientId,
    assigned_from: new Date(),
  };
}

module.exports = {
  createPatient,
  getPatientById,
  updatePatient,
  getPatientVitals,
  getPatientSummary,
  assignDevice,
};

