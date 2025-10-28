/**
 * ═══════════════════════════════════════════════════════════════════
 * AGORA PLATFORM - API CLIENT WITH AUTO TOKEN REFRESH
 * Automatically adds auth tokens and refreshes them when expired
 * ═══════════════════════════════════════════════════════════════════
 */

import config from '../config';
import authManager from './authManager';

/**
 * Enhanced fetch with automatic token handling
 */
async function apiClient(url, options = {}) {
  // Get full URL
  const fullUrl = url.startsWith('http') ? url : `${config.API_URL}${url}`;
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add auth token if user is authenticated
  if (authManager.isAuthenticated()) {
    try {
      const token = await authManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      // Token refresh failed, might need to re-login
    }
  }
  
  // Make request
  const response = await fetch(fullUrl, {
    ...options,
    headers
  });
  
  // Handle token expiration
  if (response.status === 401) {
    const data = await response.json();
    
    if (data.code === 'TOKEN_EXPIRED') {
      // Try to refresh token
      try {
        await authManager.refreshAccessToken();
        
        // Retry request with new token
        const newToken = await authManager.getAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        
        return fetch(fullUrl, {
          ...options,
          headers
        });
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        authManager.clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired';
        }
        throw refreshError;
      }
    }
  }
  
  return response;
}

/**
 * Convenience methods
 */
export const api = {
  get: (url, options = {}) => apiClient(url, { ...options, method: 'GET' }),
  
  post: (url, data, options = {}) => apiClient(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  put: (url, data, options = {}) => apiClient(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (url, options = {}) => apiClient(url, { ...options, method: 'DELETE' }),
  
  // Raw fetch with auth (for custom use cases)
  fetch: apiClient
};

export default api;
