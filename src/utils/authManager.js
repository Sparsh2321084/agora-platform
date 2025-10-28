/**
 * ═══════════════════════════════════════════════════════════════════
 * AGORA PLATFORM - ADVANCED AUTHENTICATION MANAGER
 * Handles automatic token refresh, session validation, and inactivity tracking
 * ═══════════════════════════════════════════════════════════════════
 */

import config from '../config';

const AUTH_STORAGE_KEY = 'agoraAuth';
const REFRESH_BUFFER = 2 * 60 * 1000; // Refresh 2 minutes before expiry
const ACTIVITY_CHECK_INTERVAL = 30 * 1000; // Check activity every 30 seconds
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

class AuthManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.sessionId = null;
    this.tokenExpiry = null;
    this.sessionExpiry = null;
    this.lastActivity = Date.now();
    this.refreshTimer = null;
    this.activityTimer = null;
    this.listeners = [];
    
    // Load saved auth state
    this.loadAuthState();
    
    // Start activity tracking
    this.startActivityTracking();
    
    // Start automatic token refresh
    this.scheduleTokenRefresh();
  }

  /**
   * Load authentication state from storage
   */
  loadAuthState() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const auth = JSON.parse(stored);
        this.accessToken = auth.accessToken;
        this.refreshToken = auth.refreshToken;
        this.sessionId = auth.sessionId;
        this.tokenExpiry = auth.tokenExpiry;
        this.sessionExpiry = auth.sessionExpiry;
        this.lastActivity = auth.lastActivity || Date.now();
        
        // Check if session is still valid
        if (this.isSessionExpired()) {
          this.clearAuth();
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.clearAuth();
    }
  }

  /**
   * Save authentication state to storage
   */
  saveAuthState() {
    const auth = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      sessionId: this.sessionId,
      tokenExpiry: this.tokenExpiry,
      sessionExpiry: this.sessionExpiry,
      lastActivity: this.lastActivity
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }

  /**
   * Set authentication tokens after login
   */
  setAuth(tokens, session, user) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.sessionId = session.sessionId;
    this.tokenExpiry = Date.now() + (tokens.expiresIn * 1000);
    this.sessionExpiry = Date.now() + session.maxDuration;
    this.lastActivity = Date.now();
    
    this.saveAuthState();
    
    // Also save user data separately (for backward compatibility)
    localStorage.setItem('agoraUser', JSON.stringify(user));
    
    // Schedule token refresh
    this.scheduleTokenRefresh();
    
    // Notify listeners
    this.notifyListeners('login', user);
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.accessToken = null;
    this.refreshToken = null;
    this.sessionId = null;
    this.tokenExpiry = null;
    this.sessionExpiry = null;
    
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('agoraUser');
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    this.notifyListeners('logout');
  }

  /**
   * Get current access token (automatically refreshes if needed)
   */
  async getAccessToken() {
    // Check if token needs refresh
    if (this.shouldRefreshToken()) {
      await this.refreshAccessToken();
    }
    
    return this.accessToken;
  }

  /**
   * Check if token should be refreshed
   */
  shouldRefreshToken() {
    if (!this.accessToken || !this.tokenExpiry) return false;
    const timeUntilExpiry = this.tokenExpiry - Date.now();
    return timeUntilExpiry < REFRESH_BUFFER;
  }

  /**
   * Check if session has expired
   */
  isSessionExpired() {
    const now = Date.now();
    
    // Check max session duration
    if (this.sessionExpiry && now > this.sessionExpiry) {
      console.log('Session expired: max duration exceeded');
      return true;
    }
    
    // Check inactivity timeout
    const timeSinceActivity = now - this.lastActivity;
    if (timeSinceActivity > INACTIVITY_TIMEOUT) {
      console.log('Session expired: inactivity timeout');
      return true;
    }
    
    return false;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(`${config.API_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.code === 'SESSION_EXPIRED' || data.code === 'REFRESH_EXPIRED') {
          this.clearAuth();
          this.notifyListeners('session-expired');
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Token refresh failed');
      }
      
      // Update access token
      this.accessToken = data.accessToken;
      this.tokenExpiry = Date.now() + (data.expiresIn * 1000);
      this.lastActivity = Date.now();
      
      this.saveAuthState();
      this.scheduleTokenRefresh();
      
      return this.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    if (!this.tokenExpiry) return;
    
    const timeUntilRefresh = this.tokenExpiry - Date.now() - REFRESH_BUFFER;
    
    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          console.error('Scheduled token refresh failed:', error);
        }
      }, timeUntilRefresh);
    }
  }

  /**
   * Start tracking user activity
   */
  startActivityTracking() {
    // Track user interactions
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.saveAuthState();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Periodic session validation
    this.activityTimer = setInterval(() => {
      if (this.isSessionExpired() && this.accessToken) {
        this.clearAuth();
        this.notifyListeners('session-expired');
        
        // Only redirect if on authenticated-only pages
        const publicPaths = ['/', '/login', '/register', '/about'];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login?session=expired';
        }
      }
    }, ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Notify server
      if (this.sessionId) {
        await fetch(`${config.API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: this.sessionId
          })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken && !this.isSessionExpired();
  }

  /**
   * Add listener for auth events
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners of auth events
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    const now = Date.now();
    return {
      sessionId: this.sessionId,
      lastActivity: this.lastActivity,
      timeSinceActivity: now - this.lastActivity,
      timeUntilInactivityTimeout: INACTIVITY_TIMEOUT - (now - this.lastActivity),
      timeUntilSessionExpiry: this.sessionExpiry - now,
      isExpiringSoon: (this.sessionExpiry - now) < 5 * 60 * 1000 // Less than 5 minutes
    };
  }
}

// Create singleton instance
const authManager = new AuthManager();

export default authManager;
