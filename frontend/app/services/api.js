const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fetch all patients
 * @returns {Promise<Array>} List of patients
 */
export async function getPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/patients/`);
        if (!response.ok) {
            throw new Error('Failed to fetch patients');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
}

/**
 * Fetch patient history
 * @param {number} patientId
 * @param {number} limit
 * @returns {Promise<Array>} List of vital signs
 */
export async function getPatientHistory(patientId, limit = 100) {
    try {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/history?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch patient history');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching history for patient ${patientId}:`, error);
        throw error;
    }
}
