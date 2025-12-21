// API base URL - handle both with and without /api suffix
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
console.log('API_BASE_URL is:', API_BASE_URL);

import { getToken } from './auth';

/**
 * Fetch all patients
 * @returns {Promise<Array>} List of patients
 */
export async function getPatients() {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const url = `${API_BASE_URL}/patients/`;
        console.log('Fetching patients from:', url);
        console.log('Token present:', !!token);
        
        const response = await fetch(url, {
            headers: headers
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Patients data received:', data?.length || 0, 'patients');
        return data;
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

/**
 * Delete a patient
 * @param {number} patientId
 * @returns {Promise<void>}
 */
export async function deletePatient(patientId) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Patient not found');
            }
            throw new Error('Failed to delete patient');
        }

        return;
    } catch (error) {
        console.error(`Error deleting patient ${patientId}:`, error);
        throw error;
    }
}

/**
 * Fetch device information for a patient
 * @param {number} patientId
 * @returns {Promise<Object>} Device information
 */
export async function getPatientDevice(patientId) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/device`, {
            headers: headers
        });
        if (!response.ok) {
            throw new Error('Failed to fetch device information');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching device for patient ${patientId}:`, error);
        throw error;
    }
}

/**
 * Create emergency alert for a patient
 * @param {number} patientId
 * @returns {Promise<Object>} Created alert
 */
export async function createEmergencyAlert(patientId) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/emergency`, {
            method: 'POST',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Failed to create emergency alert');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error creating emergency alert for patient ${patientId}:`, error);
        throw error;
    }
}

/**
 * Fetch all thresholds
 * @returns {Promise<Array>} List of thresholds
 */
export async function getThresholds() {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/thresholds/`, {
            headers: headers
        });
        if (!response.ok) {
            throw new Error('Failed to fetch thresholds');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching thresholds:', error);
        throw error;
    }
}

/**
 * Update a threshold
 * @param {string} name - Threshold name (e.g., 'heart_rate')
 * @param {string} type - Threshold type ('warning' or 'critical')
 * @param {Object} data - Threshold data with min_value and max_value
 * @returns {Promise<Object>} Updated threshold
 */
export async function updateThreshold(name, type, data) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/thresholds/${name}/${type}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                name: name,
                type: type,
                min_value: data.min_value,
                max_value: data.max_value
            })
        });
        if (!response.ok) {
            throw new Error('Failed to update threshold');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error updating threshold ${name}/${type}:`, error);
        throw error;
    }
}

/**
 * Fetch alerts for a patient
 * @param {number} patientId
 * @param {number} limit - Maximum number of alerts to return
 * @returns {Promise<Array>} List of alerts
 */
export async function getPatientAlerts(patientId, limit = 50) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/alerts/patient/${patientId}?limit=${limit}`, {
            headers: headers
        });
        if (!response.ok) {
            throw new Error('Failed to fetch patient alerts');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching alerts for patient ${patientId}:`, error);
        throw error;
    }
}

/**
 * Fetch unacknowledged alerts for a patient
 * @param {number} patientId
 * @returns {Promise<Array>} List of unacknowledged alerts
 */
export async function getUnacknowledgedAlerts(patientId) {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/alerts/patient/${patientId}/unacknowledged`, {
            headers: headers
        });
        if (!response.ok) {
            throw new Error('Failed to fetch unacknowledged alerts');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching unacknowledged alerts for patient ${patientId}:`, error);
        throw error;
    }
}
