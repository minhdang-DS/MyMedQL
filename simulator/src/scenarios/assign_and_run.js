/**
 * Scenario 3: Device Assignment and Run
 * 
 * Duration: 3 minutes (180 seconds)
 * Goal: Validate device assignment before ingestion
 * 
 * This scenario first assigns a device to a patient via the API,
 * then runs a short stable scenario to verify the assignment.
 * 
 * Note: This scenario requires authentication (JWT token).
 * Set AUTH_TOKEN environment variable or modify the code to handle login.
 */

module.exports = {
  name: 'Device Assignment and Run',
  duration: 180, // 3 minutes in seconds
  description: 'Assigns device to patient, then runs stable vitals',
  requiresAssignment: true, // Flag to indicate device assignment is needed
  
  vitals: {
    // All vitals remain stable (similar to stable scenario)
    heart_rate: [
      { time: 0, type: 'constant', value: 75 },
    ],
    spo2: [
      { time: 0, type: 'constant', value: 97 },
    ],
    bp_systolic: [
      { time: 0, type: 'constant', value: 118 },
    ],
    bp_diastolic: [
      { time: 0, type: 'constant', value: 72 },
    ],
    temperature: [
      { time: 0, type: 'constant', value: 36.9 },
    ],
    respiration: [
      { time: 0, type: 'constant', value: 17 },
    ],
  },
};

