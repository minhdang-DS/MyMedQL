const axios = require('axios');
const config = require('../config/default.json');
require('dotenv').config();

/**
 * API Client for MyMedQL Backend
 * Handles communication with the backend ingestion endpoint
 */
class APIClient {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || config.api.baseUrl;
    this.apiKey = process.env.INGESTION_API_KEY || config.api.apiKey;
    this.assignmentToken = null; // JWT token for device assignment (if needed)
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set API key for ingestion endpoint
   * @param {string} apiKey - API key for authentication
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Set JWT token for authenticated endpoints (device assignment)
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.assignmentToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Send vital signs data to the backend ingestion endpoint
   * @param {Object} vitalsData - Vital signs payload
   * @returns {Promise<Object>} Response from backend
   */
  async sendData(vitalsData) {
    try {
      const response = await this.client.post(
        config.api.ingestionEndpoint,
        vitalsData,
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
        }
      );
      
      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          status: error.response.status,
          error: error.response.data?.error || error.message,
          data: error.response.data,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          status: 0,
          error: 'Network error: No response from server',
        };
      } else {
        // Error in request setup
        return {
          success: false,
          status: 0,
          error: error.message,
        };
      }
    }
  }

  /**
   * Assign device to patient
   * @param {number} deviceId - Device ID
   * @param {number} patientId - Patient ID
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Response from backend
   */
  async assignDevice(deviceId, patientId, notes = null) {
    if (!this.assignmentToken) {
      throw new Error('Authentication token required for device assignment');
    }

    try {
      const response = await this.client.post(
        `${config.api.assignmentEndpoint}/${deviceId}/assign`,
        {
          patient_id: patientId,
          notes: notes || `Device ${deviceId} assigned to patient ${patientId} via simulator`,
        }
      );
      
      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          status: error.response.status,
          error: error.response.data?.error || error.message,
          data: error.response.data,
        };
      } else {
        return {
          success: false,
          status: 0,
          error: error.message,
        };
      }
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new APIClient();
