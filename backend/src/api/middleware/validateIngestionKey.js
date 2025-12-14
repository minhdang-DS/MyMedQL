/**
 * Validate ingestion API key for device vitals ingestion endpoint
 * This endpoint is public but secured by API key
 */
function validateIngestionKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const expectedKey = process.env.INGESTION_API_KEY || 'default-ingestion-key-change-in-production';
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ 
      error: 'Invalid or missing API key',
      message: 'This endpoint requires a valid API key in X-API-Key header or api_key query parameter',
    });
  }
  
  next();
}

module.exports = validateIngestionKey;

