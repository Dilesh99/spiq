// API service for handling network requests with authentication
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://18.142.49.203:5000';

class ApiService {
  /**
   * Make an authenticated API request
   * @param {string} endpoint - The API endpoint (without base URL)
   * @param {Object} options - Fetch options (method, body, etc.)
   * @param {boolean} requiresAuth - Whether this request requires authentication
   * @returns {Promise<any>} - The response data
   */
  static async request(endpoint, options = {}, requiresAuth = true) {
    const url = `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication if required
    if (requiresAuth) {
      try {
        const token = await this.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting access token:', error);
        // Continue without token - the server will reject if necessary
      }
    }

    // Prepare the request
    const requestOptions = {
      ...options,
      headers,
    };

    // Make the request
    try {
      const response = await fetch(url, requestOptions);
      
      // Handle 401 (Unauthorized) by refreshing token and retrying
      if (response.status === 401 && requiresAuth) {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Update the Authorization header and retry
          requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, requestOptions).then(this.handleResponse);
        }
      }
      
      return this.handleResponse(response);
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * Handle API response
   * @param {Response} response - The fetch Response object
   * @returns {Promise<any>} - The parsed response data
   */
  static async handleResponse(response) {
    // For 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    // Try to parse as JSON first
    try {
      const data = await response.json();
      
      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      // If it's not valid JSON or other error occurred
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // For successful responses that are not JSON
      return response.text();
    }
  }

  /**
   * Get the current access token
   * @returns {Promise<string|null>} - The access token, or null if not available
   */
  static async getAccessToken() {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting access token from storage:', error);
      return null;
    }
  }

  /**
   * Refresh the access token using the refresh token
   * @returns {Promise<string|null>} - The new access token, or null if refresh failed
   */
  static async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${BACKEND_URL}/auth/refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (data.accessToken) {
        await AsyncStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Convenience method for GET requests
   * @param {string} endpoint - The API endpoint
   * @param {boolean} requiresAuth - Whether this request requires authentication
   * @returns {Promise<any>} - The response data
   */
  static async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'GET' }, requiresAuth);
  }

  /**
   * Convenience method for POST requests
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The data to send
   * @param {boolean} requiresAuth - Whether this request requires authentication
   * @returns {Promise<any>} - The response data
   */
  static async post(endpoint, data = {}, requiresAuth = true) {
    return this.request(
      endpoint, 
      { 
        method: 'POST',
        body: JSON.stringify(data)
      },
      requiresAuth
    );
  }

  /**
   * Convenience method for PUT requests
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The data to send
   * @param {boolean} requiresAuth - Whether this request requires authentication
   * @returns {Promise<any>} - The response data
   */
  static async put(endpoint, data = {}, requiresAuth = true) {
    return this.request(
      endpoint, 
      { 
        method: 'PUT',
        body: JSON.stringify(data)
      },
      requiresAuth
    );
  }

  /**
   * Convenience method for DELETE requests
   * @param {string} endpoint - The API endpoint
   * @param {boolean} requiresAuth - Whether this request requires authentication
   * @returns {Promise<any>} - The response data
   */
  static async delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'DELETE' }, requiresAuth);
  }
}

export default ApiService; 