const vitalsService = require('../../services/vitalsService');
const websocketServer = require('../../websocket/websocketServer');

/**
 * Ingest vital signs data
 * POST /api/v1/devices/ingest
 * High-frequency endpoint for device data ingestion
 */
async function ingestVitals(req, res, next) {
  try {
    const vitalsData = {
      patient_id: parseInt(req.body.patient_id),
      device_id: req.body.device_id ? parseInt(req.body.device_id) : null,
      ts: req.body.ts ? new Date(req.body.ts) : new Date(),
      heart_rate: req.body.heart_rate ? parseInt(req.body.heart_rate) : null,
      spo2: req.body.spo2 ? parseInt(req.body.spo2) : null,
      bp_systolic: req.body.bp_systolic ? parseInt(req.body.bp_systolic) : null,
      bp_diastolic: req.body.bp_diastolic ? parseInt(req.body.bp_diastolic) : null,
      temperature_c: req.body.temperature_c ? parseFloat(req.body.temperature_c) : null,
      respiration: req.body.respiration ? parseInt(req.body.respiration) : null,
      metadata: req.body.metadata || null,
    };
    
    // Validate required fields
    if (!vitalsData.patient_id) {
      return res.status(400).json({ error: 'patient_id is required' });
    }
    
    // Insert vitals (triggers will create alerts automatically)
    const vitals = await vitalsService.ingestVitals(vitalsData);
    
    // Broadcast to WebSocket clients watching this patient
    websocketServer.broadcastVitalsUpdate(vitals);
    
    res.status(201).json({
      message: 'Vitals ingested successfully',
      vitals,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ingestVitals,
};

