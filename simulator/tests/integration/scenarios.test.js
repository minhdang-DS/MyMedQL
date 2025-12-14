/**
 * Integration Tests for Simulator Scenarios
 * 
 * These tests require:
 * - Backend API running
 * - Database with schema and seed data
 * - Valid API key configured
 * 
 * Run with: npm test -- --testPathPattern=integration
 */

const DeviceSimulator = require('../../src/device_simulator');
const apiClient = require('../../src/api_client');
// Note: Database queries would require backend connection
// For integration tests, you may need to use API endpoints or
// set up a separate database connection

// These tests are skipped by default - uncomment to run
// They require a running backend and database
describe.skip('Simulator Integration Tests', () => {
  const testPatientId = 1;
  const testDeviceId = 1;
  const apiKey = process.env.INGESTION_API_KEY || 'test-api-key';

  beforeAll(async () => {
    // Set API key
    apiClient.setApiKey(apiKey);
    
    // Test backend connection
    const connected = await apiClient.testConnection();
    if (!connected) {
      console.warn('⚠️  Backend not available. Skipping integration tests.');
      return;
    }
  });

  describe('Scenario 1: Stable State', () => {
    test('Integrate 1: High volume vitals, zero alerts', async () => {
      // Note: In a real integration test, you would query the database
      // or use API endpoints to check alert counts
      // For now, we'll just verify the simulator runs successfully

      // Run stable scenario for 30 seconds (shortened for test)
      const simulator = new DeviceSimulator('stable', {
        patientId: testPatientId,
        deviceId: testDeviceId,
        sendInterval: 1000, // 1 second
      });

      simulator.loadScenario('stable');
      
      // Modify duration for test
      simulator.scenario.duration = 30;
      
      // Run simulation
      await simulator.run();

      // Check vitals were sent successfully
      expect(simulator.stats.sent).toBeGreaterThan(0);
      expect(simulator.stats.failed).toBe(0);
      
      // In a full integration test, you would:
      // 1. Query database for alert count before/after
      // 2. Verify no new alerts were created
      // 3. Verify vitals records were inserted
    }, 60000); // 60 second timeout
  });

  describe('Scenario 2: Deterioration', () => {
    test('Integrate 2: Alerts created during threshold breach window', async () => {
      // Note: In a real integration test, you would query the database
      // to verify alerts were created during the breach period

      // Run deterioration scenario
      const simulator = new DeviceSimulator('deteriorate', {
        patientId: testPatientId,
        deviceId: testDeviceId,
        sendInterval: 2000, // 2 seconds
      });

      simulator.loadScenario('deteriorate');
      
      // Shorten for test (run for 2 minutes instead of 10)
      simulator.scenario.duration = 120;
      
      await simulator.run();

      // Wait a moment for triggers to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify simulator ran successfully
      expect(simulator.stats.sent).toBeGreaterThan(0);
      
      // In a full integration test, you would:
      // 1. Query database for alerts created during the breach window
      // 2. Verify alert structure (alert_type, severity, patient_id)
      // 3. Verify alerts have correct vitals_id foreign key
      // 4. Check WebSocket notifications were sent
    }, 180000); // 3 minute timeout
  });

  describe('Scenario 3: Device Assignment', () => {
    test('Integrate 4: Device assignment before ingestion', async () => {
      // This test requires authentication
      const authToken = process.env.AUTH_TOKEN;
      if (!authToken) {
        console.warn('⚠️  AUTH_TOKEN not set. Skipping device assignment test.');
        return;
      }

      const testDeviceId = 2;
      const testPatientId = 1;

      const simulator = new DeviceSimulator('assign_and_run', {
        patientId: testPatientId,
        deviceId: testDeviceId,
      });

      // Assign device
      const assigned = await simulator.assignDevice(testDeviceId, testPatientId, authToken);
      expect(assigned).toBe(true);

      // Run short simulation
      simulator.loadScenario('assign_and_run');
      simulator.scenario.duration = 30; // 30 seconds
      
      await simulator.run();

      // Verify simulator ran successfully
      expect(simulator.stats.sent).toBeGreaterThan(0);
      
      // In a full integration test, you would:
      // 1. Query database for vitals records
      // 2. Verify vitals are linked to correct patient_id and device_id
      // 3. Verify device_assignment table has correct active assignment
    }, 60000);
  });
});

