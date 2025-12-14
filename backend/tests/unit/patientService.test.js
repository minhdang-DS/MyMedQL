const patientService = require('../../src/services/patientService');
const encryption = require('../../src/utils/encryption');

// Mock dependencies
jest.mock('../../src/db/queries/patientQueries');
jest.mock('../../src/db/queries/deviceQueries');
jest.mock('../../src/utils/encryption');

const patientQueries = require('../../src/db/queries/patientQueries');
const deviceQueries = require('../../src/db/queries/deviceQueries');

describe('Patient Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Encryption', () => {
    test('Patient 1: medical_history is encrypted before being passed to DB', async () => {
      const mockEncrypted = Buffer.from('encrypted-data');
      encryption.encrypt.mockReturnValue(mockEncrypted);
      
      const patientData = {
        first_name: 'John',
        last_name: 'Doe',
        medical_history: 'Patient has diabetes and hypertension',
      };
      
      patientQueries.createPatient.mockResolvedValue(1);
      patientQueries.getPatientById.mockResolvedValue({
        patient_id: 1,
        ...patientData,
        medical_history: mockEncrypted,
      });
      
      await patientService.createPatient(patientData);
      
      // Verify encryption was called
      expect(encryption.encrypt).toHaveBeenCalledWith('Patient has diabetes and hypertension');
      
      // Verify encrypted data was passed to query
      expect(patientQueries.createPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          medical_history: mockEncrypted,
        })
      );
    });

    test('Patient 2: medical_history is decrypted when retrieved', async () => {
      const plainText = 'Patient has diabetes and hypertension';
      const encrypted = Buffer.from('encrypted-data');
      
      patientQueries.getPatientById.mockResolvedValue({
        patient_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        medical_history: encrypted,
      });
      
      encryption.decrypt.mockReturnValue(plainText);
      
      const patient = await patientService.getPatientById(1);
      
      // Verify decryption was called
      expect(encryption.decrypt).toHaveBeenCalledWith(encrypted);
      
      // Verify decrypted data is returned
      expect(patient.medical_history).toBe(plainText);
    });
  });
});

