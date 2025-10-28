import React, { useState, useEffect } from 'react';
import authManager from '../utils/authManager';
import './SessionWarning.css';

/**
 * Session Warning Component
 * Shows warning when session is about to expire
 */
function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    const checkSession = () => {
      if (!authManager.isAuthenticated()) {
        setShowWarning(false);
        return;
      }

      const info = authManager.getSessionInfo();
      setSessionInfo(info);

      // Show warning if less than 5 minutes remaining or inactivity approaching
      if (info && (info.isExpiringSoon || info.timeUntilInactivityTimeout < 2 * 60 * 1000)) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30 * 1000);
    checkSession();

    return () => clearInterval(interval);
  }, []);

  const extendSession = () => {
    // Activity will be automatically tracked
    authManager.lastActivity = Date.now();
    authManager.saveAuthState();
    setShowWarning(false);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (!showWarning || !sessionInfo) return null;

  const isInactivityWarning = sessionInfo.timeUntilInactivityTimeout < 2 * 60 * 1000;
  const isExpiryWarning = sessionInfo.isExpiringSoon;

  return (
    <div className="session-warning">
      <div className="session-warning-content">
        <span className="warning-icon">⏰</span>
        <div className="warning-text">
          {isInactivityWarning && (
            <>
              <strong>Inactivity Warning</strong>
              <p>Your session will expire in {formatTime(sessionInfo.timeUntilInactivityTimeout)} due to inactivity</p>
            </>
          )}
          {isExpiryWarning && !isInactivityWarning && (
            <>
              <strong>Session Expiring Soon</strong>
              <p>Your session will end in {formatTime(sessionInfo.timeUntilSessionExpiry)}</p>
            </>
          )}
        </div>
        <button className="extend-btn" onClick={extendSession}>
          Stay Active
        </button>
      </div>
    </div>
  );
}

export default SessionWarning;
