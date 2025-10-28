/**
 * AGORA PLATFORM - WEBSOCKET CLIENT UTILITY
 * Real-time communication using Socket.IO
 */

import { io } from 'socket.io-client';
import config from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize Socket.IO connection
   */
  connect(userData = null) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return this.socket;
    }

    try {
      this.socket = io(config.API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000
      });

      this.setupEventHandlers(userData);
      
      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      return null;
    }
  }

  /**
   * Setup default event handlers
   */
  setupEventHandlers(userData) {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Announce user is online
      if (userData) {
        this.emit('user_online', {
          userId: userData.userId,
          username: userData.username
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Re-announce user online after reconnection
      if (userData) {
        this.emit('user_online', {
          userId: userData.userId,
          username: userData.username
        });
      }
    });
  }

  /**
   * Emit an event to the server
   */
  emit(eventName, data) {
    if (!this.socket || !this.isConnected) {
      console.warn(`Cannot emit ${eventName}: Socket not connected`);
      return false;
    }

    this.socket.emit(eventName, data);
    return true;
  }

  /**
   * Listen to an event from the server
   */
  on(eventName, callback) {
    if (!this.socket) {
      console.warn(`Cannot listen to ${eventName}: Socket not initialized`);
      return;
    }

    // Store callback reference for cleanup
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);

    this.socket.on(eventName, callback);
  }

  /**
   * Stop listening to an event
   */
  off(eventName, callback) {
    if (!this.socket) return;

    this.socket.off(eventName, callback);

    // Remove from tracked listeners
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Join a discussion room
   */
  joinDiscussion(discussionId, userId, username) {
    return this.emit('join_discussion', {
      discussionId,
      userId,
      username
    });
  }

  /**
   * Leave a discussion room
   */
  leaveDiscussion(discussionId, username) {
    return this.emit('leave_discussion', {
      discussionId,
      username
    });
  }

  /**
   * Notify that user is typing
   */
  typingStart(discussionId, username) {
    return this.emit('typing_start', {
      discussionId,
      username
    });
  }

  /**
   * Notify that user stopped typing
   */
  typingStop(discussionId, username) {
    return this.emit('typing_stop', {
      discussionId,
      username
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      // Clean up all event listeners
      for (const [eventName, callbacks] of this.eventListeners.entries()) {
        callbacks.forEach(callback => {
          this.socket.off(eventName, callback);
        });
      }
      this.eventListeners.clear();

      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected and cleaned up');
    }
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
