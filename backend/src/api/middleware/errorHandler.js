/**
 * Global error handler middleware
 * Handles errors and sends appropriate HTTP responses
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Default error
  let status = 500;
  let message = 'Internal server error';
  
  // Handle specific error types
  if (err.message) {
    message = err.message;
  }
  
  if (err.message === 'Patient not found' || err.message === 'Staff not found' || err.message === 'Alert not found') {
    status = 404;
  } else if (err.message === 'Invalid credentials' || err.message === 'Invalid or expired token') {
    status = 401;
  } else if (err.message.includes('permission') || err.message.includes('Insufficient')) {
    status = 403;
  } else if (err.message.includes('must have an active admission')) {
    status = 400;
  }
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;

