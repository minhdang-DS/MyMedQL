// Test setup file
// Can be used for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long!!';
process.env.INGESTION_API_KEY = 'test-ingestion-key';
process.env.DB_NAME = 'MyMedQL_test';

