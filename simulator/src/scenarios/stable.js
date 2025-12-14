/**
 * Scenario 1: Stable State
 * 
 * Duration: 5 minutes (300 seconds)
 * Goal: Demonstrate high-frequency ingestion without triggering alerts
 * 
 * All vitals remain within safe thresholds throughout the scenario.
 */

module.exports = {
  name: 'Stable State',
  duration: 300, // 5 minutes in seconds
  description: 'All vitals remain stable within normal ranges',
  
  vitals: {
    // Heart Rate: Normal range 60-100 bpm
    heart_rate: [
      { time: 0, type: 'constant', value: 72 },
    ],
    
    // SpO2: Normal range 95-100%
    spo2: [
      { time: 0, type: 'constant', value: 98 },
    ],
    
    // Blood Pressure: Normal systolic 90-120, diastolic 60-80
    bp_systolic: [
      { time: 0, type: 'constant', value: 115 },
    ],
    bp_diastolic: [
      { time: 0, type: 'constant', value: 75 },
    ],
    
    // Temperature: Normal range 36.1-37.2°C
    temperature: [
      { time: 0, type: 'constant', value: 36.8 },
    ],
    
    // Respiration: Normal range 12-20 breaths/min
    respiration: [
      { time: 0, type: 'constant', value: 16 },
    ],
  },
};

