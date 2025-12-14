const apiClient = require('../../src/api_client');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Client - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiClient.setApiKey('test-api-key');
    apiClient.setAuthToken(null);
    delete apiClient.client.defaults.headers.common['Authorization'];
  });

  describe('sendData', () => {
    test('API Client 1: Successful POST returns 200/201', async () => {
      const mockVitalsData = {
        patient_id: 1,
        device_id: 1,
        heart_rate: 75,
        spo2: 98,
      };

      const mockResponse = {
        status: 201,
        data: {
          message: 'Vitals ingested successfully',
          vitals: { vitals_id: 123, ...mockVitalsData },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        defaults: { headers: { common: {} } },
      });

      // Re-initialize client to use mocked axios
      const result = await apiClient.sendData(mockVitalsData);

      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
      expect(result.data).toHaveProperty('message');
    });

    test('API Client 2: Invalid API Key returns 401/403', async () => {
      const mockVitalsData = {
        patient_id: 1,
        heart_rate: 75,
      };

      const mockError = {
        response: {
          status: 401,
          data: {
            error: 'Invalid or missing API key',
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        get: jest.fn(),
        defaults: { headers: { common: {} } },
      });

      const result = await apiClient.sendData(mockVitalsData);

      expect(result.success).toBe(false);
      expect([401, 403]).toContain(result.status);
      expect(result.error).toContain('API key');
    });

    test('API Client 3: Malformed payload returns 400', async () => {
      const mockVitalsData = {
        // Missing required patient_id
        heart_rate: 75,
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            error: 'patient_id is required',
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        get: jest.fn(),
        defaults: { headers: { common: {} } },
      });

      const result = await apiClient.sendData(mockVitalsData);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('required');
    });

    test('Network error handling', async () => {
      const mockVitalsData = {
        patient_id: 1,
        heart_rate: 75,
      };

      const mockError = {
        request: {}, // Network error - no response
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
        get: jest.fn(),
        defaults: { headers: { common: {} } },
      });

      const result = await apiClient.sendData(mockVitalsData);

      expect(result.success).toBe(false);
      expect(result.status).toBe(0);
      expect(result.error).toContain('Network error');
    });
  });

  describe('assignDevice', () => {
    test('Device assignment requires auth token', async () => {
      apiClient.setAuthToken(null);
      
      await expect(apiClient.assignDevice(1, 1))
        .rejects.toThrow('Authentication token required');
    });

    test('Successful device assignment', async () => {
      apiClient.setAuthToken('test-token');
      
      const mockResponse = {
        status: 201,
        data: {
          message: 'Device assigned successfully',
          assignment: { assignment_id: 1 },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        get: jest.fn(),
        defaults: { 
          headers: { 
            common: { 'Authorization': 'Bearer test-token' } 
          } 
        },
      });

      const result = await apiClient.assignDevice(1, 1, 'Test assignment');

      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
    });
  });
});

