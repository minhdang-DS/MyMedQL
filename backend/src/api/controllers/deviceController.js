const patientService = require('../../services/patientService');

/**
 * Assign device to patient
 * POST /api/v1/devices/:id/assign
 */
async function assignDevice(req, res, next) {
  try {
    const deviceId = parseInt(req.params.id);
    const { patient_id, notes } = req.body;
    
    if (!patient_id) {
      return res.status(400).json({ error: 'patient_id is required' });
    }
    
    const assignment = await patientService.assignDevice(
      deviceId,
      parseInt(patient_id),
      req.user.staff_id,
      notes
    );
    
    res.status(201).json({
      message: 'Device assigned successfully',
      assignment,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  assignDevice,
};

