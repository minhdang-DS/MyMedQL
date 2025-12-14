const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const validateIngestionKey = require('../middleware/validateIngestionKey');

/**
 * POST /api/v1/devices/ingest
 * High-frequency endpoint for vital signs ingestion
 * Secured by API key (not JWT)
 */
router.post('/ingest', validateIngestionKey, vitalsController.ingestVitals);

module.exports = router;

