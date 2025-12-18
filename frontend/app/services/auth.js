const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Token response
 */
export async function login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    try {
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        setToken(data.access_token);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}


/**
 * Login patient with ID and password
 * @param {string} patientId
 * @param {string} password
 * @returns {Promise<Object>} Token response
 */
export async function loginPatient(patientId, password) {
    const formData = new URLSearchParams();
    formData.append('username', `patient_${patientId}`); // Special format for patient login
    formData.append('password', password);

    try {
        const response = await fetch(`${API_BASE_URL}/patient/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        setToken(data.access_token);
        return data;
    } catch (error) {
        console.error('Patient login error:', error);
        throw error;
    }
}

/**
 * Logout by removing token
 */
export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
    }
}

/**
 * Get stored access token
 * @returns {string|null} Access token
 */
export function getToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
}

/**
 * Set access token
 * @param {string} token
 */
export function setToken(token) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Get current user from token
 * @returns {Object|null} User object or null
 */
export function getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    // Simple decode since we don't have jwt-decode library installed
    // and we just need the payload
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
