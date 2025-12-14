const vitalsQueries = require('../db/queries/vitalsQueries');
const patientQueries = require('../db/queries/patientQueries');

/**
 * Ingest vital signs data
 * Note: Alert creation is handled by database triggers, not this service
 */
async function ingestVitals(vitalsData) {
  // Validate patient exists and has active admission
  const admission = await patientQueries.getActiveAdmission(vitalsData.patient_id);
  if (!admission) {
    throw new Error('Patient must have an active admission to record vitals');
  }
  
  // Insert vitals (trigger will create alerts if thresholds are breached)
  const vitalsId = await vitalsQueries.insertVitals(vitalsData);
  
  // Get the inserted record
  const vitals = await vitalsQueries.getLatestVitals(vitalsData.patient_id);
  
  // Parse JSON metadata if present
  if (vitals && vitals.metadata && typeof vitals.metadata === 'string') {
    try {
      vitals.metadata = JSON.parse(vitals.metadata);
    } catch (error) {
      // Keep as string if parsing fails
    }
  }
  
  return vitals;
}

/**
 * Get vitals by patient and time range
 */
async function getVitalsByRange(patientId, startTime, endTime) {
  const vitals = await vitalsQueries.getVitalsByRange(patientId, startTime, endTime);
  
  // Parse JSON metadata
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
 * Get latest vitals for a patient
 */
async function getLatestVitals(patientId) {
  const vitals = await vitalsQueries.getLatestVitals(patientId);
  
  if (vitals && vitals.metadata && typeof vitals.metadata === 'string') {
    try {
      vitals.metadata = JSON.parse(vitals.metadata);
    } catch (error) {
      // Keep as string if parsing fails
    }
  }
  
  return vitals;
}

module.exports = {
  ingestVitals,
  getVitalsByRange,
  getLatestVitals,
};

