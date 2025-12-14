const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const db = require('./db/connection');
const errorHandler = require('./api/middleware/errorHandler');
const websocketServer = require('./websocket/websocketServer');

// Import routes
const authRoutes = require('./api/routes/authRoutes');
const staffRoutes = require('./api/routes/staffRoutes');
const patientRoutes = require('./api/routes/patientRoutes');
const vitalsRoutes = require('./api/routes/vitalsRoutes');
const deviceRoutes = require('./api/routes/deviceRoutes');
const alertRoutes = require('./api/routes/alertRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'MyMedQL Backend API',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/devices', vitalsRoutes); // Vitals ingestion endpoint
app.use('/api/v1/devices', deviceRoutes); // Device assignment endpoint (must be after vitalsRoutes)
app.use('/api/v1/alerts', alertRoutes);

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database connection and start server
async function startServer() {
  try {
    // Test database connection
    await db.testConnection();
    
    // Initialize WebSocket server
    websocketServer.initializeWebSocketServer(server);
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 MyMedQL Backend API running on port ${PORT}`);
      console.log(`📡 WebSocket server available at ws://localhost:${PORT}/ws`);
      console.log(`📚 API documentation: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  websocketServer.closeWebSocketServer();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  websocketServer.closeWebSocketServer();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = app;
