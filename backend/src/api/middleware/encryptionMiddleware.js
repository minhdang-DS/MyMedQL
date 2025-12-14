const encryption = require('../../utils/encryption');

/**
 * Encryption middleware for medical_history field
 * Encrypts medical_history before it reaches the service layer
 * 
 * This middleware should be applied to routes that accept medical_history
 */
function encryptionMiddleware(req, res, next) {
  if (req.body && req.body.medical_history) {
    try {
      // Encrypt medical_history if it's a string
      if (typeof req.body.medical_history === 'string') {
        req.body.medical_history = encryption.encrypt(req.body.medical_history);
      }
    } catch (error) {
      return res.status(500).json({ 
        error: 'Encryption failed',
        message: error.message,
      });
    }
  }
  
  next();
}

module.exports = encryptionMiddleware;

