const WebSocket = require('ws');
const alertQueries = require('../db/queries/alertQueries');

let wss = null;
const connectedClients = new Map(); // Map of client_id -> WebSocket

/**
 * Initialize WebSocket server
 * @param {http.Server} server - HTTP server instance
 */
function initializeWebSocketServer(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    const clientId = req.url.split('?')[1]?.split('=')[1] || `client_${Date.now()}`;
    connectedClients.set(clientId, ws);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to MyMedQL WebSocket server',
      clientId,
    }));
    
    // Handle client messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(clientId, data, ws);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      connectedClients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      connectedClients.delete(clientId);
    });
  });
  
  // Start polling for new alerts
  startAlertPolling();
  
  console.log('✅ WebSocket server initialized');
}

/**
 * Handle client messages
 */
function handleClientMessage(clientId, data, ws) {
  switch (data.type) {
    case 'subscribe':
      // Client wants to subscribe to specific patient updates
      if (data.patient_id) {
        ws.subscribedPatients = ws.subscribedPatients || new Set();
        ws.subscribedPatients.add(data.patient_id);
        ws.send(JSON.stringify({
          type: 'subscribed',
          patient_id: data.patient_id,
        }));
      }
      break;
    
    case 'unsubscribe':
      // Client wants to unsubscribe from patient updates
      if (data.patient_id && ws.subscribedPatients) {
        ws.subscribedPatients.delete(data.patient_id);
        ws.send(JSON.stringify({
          type: 'unsubscribed',
          patient_id: data.patient_id,
        }));
      }
      break;
    
    case 'ping':
      // Heartbeat
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    
    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Unknown message type',
      }));
  }
}

/**
 * Broadcast vitals update to subscribed clients
 * @param {Object} vitals - Vitals data
 */
function broadcastVitalsUpdate(vitals) {
  if (!wss) return;
  
  const message = JSON.stringify({
    type: 'vitals_update',
    data: vitals,
    timestamp: new Date().toISOString(),
  });
  
  // Broadcast to all clients subscribed to this patient
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.subscribedPatients &&
      client.subscribedPatients.has(vitals.patient_id)
    ) {
      client.send(message);
    }
  });
}

/**
 * Broadcast alert to all connected clients
 * @param {Object} alert - Alert data
 */
function broadcastAlert(alert) {
  if (!wss) return;
  
  const message = JSON.stringify({
    type: 'alert',
    data: alert,
    timestamp: new Date().toISOString(),
  });
  
  // Broadcast to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Poll database for new alerts and broadcast them
 * This is a simple polling approach. In production, consider using
 * database change streams, triggers with message queues, or similar.
 */
let lastAlertCheck = new Date();
let pollingInterval = null;

function startAlertPolling() {
  const POLL_INTERVAL = 2000; // Check every 2 seconds
  
  pollingInterval = setInterval(async () => {
    try {
      // Get alerts created since last check
      const alerts = await alertQueries.getUnresolvedAlerts(100);
      
      // Filter alerts that are new (created after last check)
      const newAlerts = alerts.filter(alert => {
        const alertTime = new Date(alert.created_at);
        return alertTime > lastAlertCheck;
      });
      
      // Broadcast new alerts
      newAlerts.forEach(alert => {
        broadcastAlert(alert);
      });
      
      // Update last check time
      if (newAlerts.length > 0) {
        lastAlertCheck = new Date();
      }
    } catch (error) {
      console.error('Error polling for alerts:', error);
    }
  }, POLL_INTERVAL);
  
  console.log('✅ Alert polling started');
}

/**
 * Stop alert polling
 */
function stopAlertPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

/**
 * Close WebSocket server
 */
function closeWebSocketServer() {
  stopAlertPolling();
  
  if (wss) {
    wss.clients.forEach((client) => {
      client.close();
    });
    wss.close();
    wss = null;
  }
  
  connectedClients.clear();
}

module.exports = {
  initializeWebSocketServer,
  broadcastVitalsUpdate,
  broadcastAlert,
  closeWebSocketServer,
};

