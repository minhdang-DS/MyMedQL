const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
import { getToken } from './auth';

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
 * Fetch single patient details
 * @param {number} patientId
 * @returns {Promise<Object>} Patient details
 */
export async function getPatient(patientId) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
            headers: headers
        });
        if (!response.ok) {
            throw new Error('Failed to fetch patient details');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching patient ${patientId}:`, error);
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
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/history?limit=${limit}`, {
            headers: headers
        });
        if (!response.ok) {
            throw new Error('Failed to fetch patient history');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching history for patient ${patientId}:`, error);
        throw error;
    }
}
