/**
 * Scenario 2: Deterioration → Recovery (Alert Trigger Test)
 * 
 * Duration: 10 minutes (600 seconds)
 * Goal: Validate trigger-based alert creation and WebSocket push
 * 
 * Timeline:
 *   T_0 → T_3 (0-180s): Stable state (HR = 70)
 *   T_3 → T_5 (180-300s): Deterioration - HR drifts up, crossing threshold at ~T_4.5
 *   T_5 → T_8 (300-480s): Critical state - HR holds above threshold (125)
 *   T_8 → T_10 (480-600s): Recovery - HR drifts back to safe range (80)
 */

module.exports = {
  name: 'Deterioration and Recovery',
  duration: 600, // 10 minutes in seconds
  description: 'Heart rate deteriorates, triggers alerts, then recovers',
  
  vitals: {
    // Heart Rate: Starts normal, deteriorates, then recovers
    // Threshold: 40-120 bpm (will breach at 120+)
    heart_rate: [
      { time: 0, type: 'constant', value: 70 },        // T_0: Stable
      { time: 180, type: 'constant', value: 70 },      // T_3: Still stable
      { time: 270, type: 'linear', value: 125 },       // T_4.5: Crosses threshold (120) around here
      { time: 300, type: 'constant', value: 125 },     // T_5: Critical state
      { time: 480, type: 'constant', value: 125 },      // T_8: Still critical
      { time: 540, type: 'linear', value: 80 },       // T_9: Recovery begins
      { time: 600, type: 'constant', value: 80 },      // T_10: Back to safe range
    ],
    
    // SpO2: Slightly decreases during deterioration, then recovers
    spo2: [
      { time: 0, type: 'constant', value: 98 },
      { time: 180, type: 'constant', value: 98 },
      { time: 300, type: 'linear', value: 92 },       // Slightly low during critical phase
      { time: 480, type: 'constant', value: 92 },
      { time: 600, type: 'linear', value: 96 },       // Recovers
    ],
    
    // Blood Pressure: Increases during deterioration
    bp_systolic: [
      { time: 0, type: 'constant', value: 115 },
      { time: 180, type: 'constant', value: 115 },
      { time: 300, type: 'linear', value: 135 },      // Elevated during critical phase
      { time: 480, type: 'constant', value: 135 },
      { time: 600, type: 'linear', value: 120 },       // Returns to normal
    ],
    bp_diastolic: [
      { time: 0, type: 'constant', value: 75 },
      { time: 180, type: 'constant', value: 75 },
      { time: 300, type: 'linear', value: 85 },       // Elevated
      { time: 480, type: 'constant', value: 85 },
      { time: 600, type: 'linear', value: 78 },       // Returns to normal
    ],
    
    // Temperature: Slightly elevated during critical phase
    temperature: [
      { time: 0, type: 'constant', value: 36.8 },
      { time: 180, type: 'constant', value: 36.8 },
      { time: 300, type: 'linear', value: 37.5 },     // Slightly elevated
      { time: 480, type: 'constant', value: 37.5 },
      { time: 600, type: 'linear', value: 37.0 },      // Returns to normal
    ],
    
    // Respiration: Increases during critical phase
    respiration: [
      { time: 0, type: 'constant', value: 16 },
      { time: 180, type: 'constant', value: 16 },
      { time: 300, type: 'linear', value: 24 },       // Increased
      { time: 480, type: 'constant', value: 24 },
      { time: 600, type: 'linear', value: 18 },       // Returns to normal
    ],
  },
};

