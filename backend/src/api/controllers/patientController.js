const patientService = require('../../services/patientService');

/**
 * Create a new patient
 * POST /api/v1/patients
 */
async function createPatient(req, res, next) {
  try {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json({
      message: 'Patient created successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient by ID
 * GET /api/v1/patients/:id
 */
async function getPatient(req, res, next) {
  try {
    const patientId = parseInt(req.params.id);
    const patient = await patientService.getPatientById(patientId);
    
    // Get summary with vitals info
    const summary = await patientService.getPatientSummary(patientId);
    
    res.json({
      ...patient,
      summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient vitals
 * GET /api/v1/patients/:id/vitals
 */
async function getPatientVitals(req, res, next) {
  try {
    const patientId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 100;
    
    const vitals = await patientService.getPatientVitals(patientId, limit);
    res.json({
      patient_id: patientId,
      count: vitals.length,
      vitals,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update patient
 * PUT /api/v1/patients/:id
 */
async function updatePatient(req, res, next) {
  try {
    const patientId = parseInt(req.params.id);
    const patient = await patientService.updatePatient(patientId, req.body);
    
    res.json({
      message: 'Patient updated successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPatient,
  getPatient,
  getPatientVitals,
  updatePatient,
};

