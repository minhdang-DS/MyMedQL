const apiClient = require('./api_client');
const config = require('../config/default.json');
const path = require('path');
const fs = require('fs');

/**
 * Device Simulator - Core Engine
 * Generates realistic vital signs data based on scenario configurations
 */
class DeviceSimulator {
  constructor(scenarioName, options = {}) {
    this.scenarioName = scenarioName;
    this.scenario = null;
    this.isRunning = false;
    this.startTime = null;
    this.currentValues = {};
    this.targetValues = {};
    this.sendInterval = options.sendInterval || config.simulator.sendInterval * 1000; // Convert to ms
    this.smoothingWindow = options.smoothingWindow || config.simulator.smoothingWindow; // seconds
    this.noiseLevel = options.noiseLevel || config.simulator.noiseLevel; // ±3% default
    this.patientId = options.patientId || config.defaults.patientId;
    this.deviceId = options.deviceId || config.defaults.deviceId;
    this.intervalId = null;
    this.stats = {
      sent: 0,
      failed: 0,
      errors: [],
    };
  }

  /**
   * Load scenario configuration
   * @param {string} scenarioName - Name of scenario file (without .js extension)
   */
  loadScenario(scenarioName) {
    const scenarioPath = path.join(__dirname, 'scenarios', `${scenarioName}.js`);
    
    if (!fs.existsSync(scenarioPath)) {
      throw new Error(`Scenario file not found: ${scenarioPath}`);
    }

    // Load scenario module
    delete require.cache[require.resolve(scenarioPath)]; // Clear cache for hot reload
    this.scenario = require(scenarioPath);
    
    // Validate scenario structure
    if (!this.scenario.duration || !this.scenario.vitals) {
      throw new Error('Invalid scenario format: missing duration or vitals');
    }

    // Initialize current values with starting values
    this.currentValues = {};
    this.targetValues = {};
    
    Object.keys(this.scenario.vitals).forEach(vital => {
      const initialValue = this.scenario.vitals[vital][0]?.value;
      if (initialValue !== undefined) {
        this.currentValues[vital] = initialValue;
        this.targetValues[vital] = initialValue;
      }
    });

    console.log(`✅ Loaded scenario: ${scenarioName}`);
    console.log(`   Duration: ${this.scenario.duration} seconds`);
    console.log(`   Vitals: ${Object.keys(this.scenario.vitals).join(', ')}`);
  }

  /**
   * Calculate current target value for a vital sign at given time
   * @param {string} vital - Vital sign name
   * @param {number} elapsedSeconds - Elapsed time in seconds
   * @returns {number} Target value
   */
  getTargetValue(vital, elapsedSeconds) {
    const vitalConfig = this.scenario.vitals[vital];
    if (!vitalConfig || vitalConfig.length === 0) {
      return null;
    }

    // Find the segment we're in
    for (let i = 0; i < vitalConfig.length; i++) {
      const segment = vitalConfig[i];
      const nextSegment = vitalConfig[i + 1];
      
      if (!nextSegment || elapsedSeconds < nextSegment.time) {
        // We're in this segment
        if (segment.type === 'constant') {
          return segment.value;
        } else if (segment.type === 'linear') {
          // Linear interpolation
          const prevSegment = vitalConfig[i - 1] || { time: 0, value: segment.value };
          const timeRange = segment.time - prevSegment.time;
          const valueRange = segment.value - prevSegment.value;
          const progress = (elapsedSeconds - prevSegment.time) / timeRange;
          return prevSegment.value + (valueRange * progress);
        }
      }
    }

    // Return last segment value
    return vitalConfig[vitalConfig.length - 1].value;
  }

  /**
   * Apply smoothing to transition between current and target values
   * @param {string} vital - Vital sign name
   * @param {number} targetValue - Target value
   * @returns {number} Smoothed current value
   */
  applySmoothing(vital, targetValue) {
    const current = this.currentValues[vital];
    if (current === undefined) {
      this.currentValues[vital] = targetValue;
      return targetValue;
    }

    // Calculate smoothing factor based on send interval and smoothing window
    const smoothingSteps = this.smoothingWindow / (this.sendInterval / 1000);
    const smoothingFactor = 1 / smoothingSteps;

    // Smooth transition towards target
    const difference = targetValue - current;
    const adjustment = difference * smoothingFactor;
    const newValue = current + adjustment;

    // Update current value
    this.currentValues[vital] = newValue;
    return newValue;
  }

  /**
   * Apply noise to a value (±noiseLevel%)
   * @param {number} value - Base value
   * @returns {number} Value with noise applied
   */
  applyNoise(value) {
    const noise = (Math.random() * 2 - 1) * this.noiseLevel; // -noiseLevel to +noiseLevel
    return value * (1 + noise);
  }

  /**
   * Round value to appropriate precision
   * @param {string} vital - Vital sign name
   * @param {number} value - Value to round
   * @returns {number} Rounded value
   */
  roundValue(vital, value) {
    if (vital === 'temperature_c') {
      return Math.round(value * 100) / 100; // 2 decimal places
    }
    return Math.round(value); // Integer for other vitals
  }

  /**
   * Generate current vital signs values
   * @param {number} elapsedSeconds - Elapsed time in seconds
   * @returns {Object} Vital signs payload
   */
  generateVitals(elapsedSeconds) {
    const vitals = {
      patient_id: this.patientId,
      device_id: this.deviceId,
      ts: new Date().toISOString(),
    };

    // Generate each vital sign
    Object.keys(this.scenario.vitals).forEach(vital => {
      // Get target value for current time
      const targetValue = this.getTargetValue(vital, elapsedSeconds);
      
      if (targetValue === null) {
        return; // Skip if no target value
      }

      // Update target
      this.targetValues[vital] = targetValue;

      // Apply smoothing
      let value = this.applySmoothing(vital, targetValue);

      // Apply noise
      value = this.applyNoise(value);

      // Round to appropriate precision
      value = this.roundValue(vital, value);

      // Map to API field names
      const apiFieldName = this.mapVitalToAPI(vital);
      if (apiFieldName) {
        vitals[apiFieldName] = value;
      }
    });

    return vitals;
  }

  /**
   * Map internal vital name to API field name
   * @param {string} vital - Internal vital name
   * @returns {string} API field name
   */
  mapVitalToAPI(vital) {
    const mapping = {
      'heart_rate': 'heart_rate',
      'spo2': 'spo2',
      'bp_systolic': 'bp_systolic',
      'bp_diastolic': 'bp_diastolic',
      'temperature': 'temperature_c',
      'respiration': 'respiration',
    };
    return mapping[vital] || vital;
  }

  /**
   * Send vital signs data to backend
   * @param {Object} vitalsData - Vital signs payload
   */
  async sendVitals(vitalsData) {
    const result = await apiClient.sendData(vitalsData);
    
    if (result.success) {
      this.stats.sent++;
      if (this.stats.sent % 10 === 0) {
        process.stdout.write(`\r📊 Sent: ${this.stats.sent} | Failed: ${this.stats.failed}`);
      }
    } else {
      this.stats.failed++;
      this.stats.errors.push({
        time: new Date().toISOString(),
        error: result.error,
        status: result.status,
      });
      
      if (result.status === 401 || result.status === 403) {
        console.error(`\n❌ Authentication error: ${result.error}`);
        console.error('   Check your INGESTION_API_KEY in .env or config');
      } else if (result.status === 400) {
        console.error(`\n❌ Validation error: ${result.error}`);
      } else {
        console.error(`\n❌ Send failed (${result.status}): ${result.error}`);
      }
    }
  }

  /**
   * Main simulation loop
   */
  async run() {
    if (this.isRunning) {
      console.error('Simulator is already running');
      return;
    }

    if (!this.scenario) {
      throw new Error('No scenario loaded. Call loadScenario() first.');
    }

    this.isRunning = true;
    this.startTime = Date.now();
    this.stats = { sent: 0, failed: 0, errors: [] };

    console.log('\n🚀 Starting simulation...');
    console.log(`   Patient ID: ${this.patientId}`);
    console.log(`   Device ID: ${this.deviceId}`);
    console.log(`   Send interval: ${this.sendInterval / 1000}s`);
    console.log(`   Duration: ${this.scenario.duration}s\n`);

    // Test API connection first
    const connected = await apiClient.testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to backend API. Is the server running?');
      this.isRunning = false;
      return;
    }
    console.log('✅ Backend API connection verified\n');

    // Start sending loop
    this.intervalId = setInterval(async () => {
      const elapsed = (Date.now() - this.startTime) / 1000; // seconds
      
      // Check if scenario duration exceeded
      if (elapsed >= this.scenario.duration) {
        this.stop();
        return;
      }

      // Generate and send vitals
      const vitalsData = this.generateVitals(elapsed);
      await this.sendVitals(vitalsData);
    }, this.sendInterval);

    // Wait for completion
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isRunning) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`\n\n✅ Simulation completed`);
    console.log(`   Duration: ${elapsed}s`);
    console.log(`   Successfully sent: ${this.stats.sent}`);
    console.log(`   Failed: ${this.stats.failed}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      this.stats.errors.slice(0, 5).forEach(err => {
        console.log(`   [${err.time}] ${err.error} (${err.status})`);
      });
      if (this.stats.errors.length > 5) {
        console.log(`   ... and ${this.stats.errors.length - 5} more`);
      }
    }
  }

  /**
   * Assign device to patient before starting simulation
   * @param {number} deviceId - Device ID
   * @param {number} patientId - Patient ID
   * @param {string} authToken - JWT token for authentication
   */
  async assignDevice(deviceId, patientId, authToken) {
    apiClient.setAuthToken(authToken);
    
    console.log(`\n🔗 Assigning device ${deviceId} to patient ${patientId}...`);
    const result = await apiClient.assignDevice(deviceId, patientId);
    
    if (result.success) {
      console.log('✅ Device assigned successfully');
      this.deviceId = deviceId;
      this.patientId = patientId;
      return true;
    } else {
      console.error(`❌ Device assignment failed: ${result.error}`);
      return false;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const scenarioName = process.argv[2] || 'stable';
  const options = {
    patientId: parseInt(process.env.PATIENT_ID) || config.defaults.patientId,
    deviceId: parseInt(process.env.DEVICE_ID) || config.defaults.deviceId,
    sendInterval: parseFloat(process.env.SEND_INTERVAL) * 1000 || config.simulator.sendInterval * 1000,
  };

  const simulator = new DeviceSimulator(scenarioName, options);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Interrupted by user');
    simulator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    simulator.stop();
    process.exit(0);
  });

  // Load and run scenario
  try {
    simulator.loadScenario(scenarioName);
    simulator.run().catch(error => {
      console.error('❌ Simulation error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start simulator:', error.message);
    process.exit(1);
  }
}

module.exports = DeviceSimulator;
