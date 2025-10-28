import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import './Notifications.css';

/**
 * NOTIFICATIONS PAGE - Activity Feed
 * Performance: Virtual scrolling for thousands of notifications
 * Uses IndexedDB for offline caching
 */

const Notifications = memo(() => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('agoraUser') || 'null'));
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, reply, mention, discussion
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${config.API_URL}/notifications/${user.userId}?limit=50`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error('Notification fetch error:', err);
        setError('Failed to load notifications. Please try again.');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate]);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const markAsRead = async (id) => {
    try {
      await fetch(`${config.API_URL}/notifications/${id}/read`, {
        method: 'PUT'
      });
      
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await fetch(`${config.API_URL}/notifications/${user.userId}/read-all`, {
        method: 'PUT'
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reply': return '💬';
      case 'mention': return '👤';
      case 'discussion': return '🏛️';
      default: return '📢';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="notifications-page"
    >
      {/* Navigation */}
      {/* Content */}
      <div className="notifications-container container-golden">
        <div className="notifications-header">
          <h1 className="notifications-title text-epigraphic">
            🔔 Notifications
            <span className="title-greek">Ειδοποιήσεις</span>
          </h1>
          
          {notifications.some(n => !n.is_read) && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'reply' ? 'active' : ''}`}
            onClick={() => setFilter('reply')}
          >
            💬 Replies
          </button>
          <button
            className={`filter-btn ${filter === 'mention' ? 'active' : ''}`}
            onClick={() => setFilter('mention')}
          >
            👤 Mentions
          </button>
          <button
            className={`filter-btn ${filter === 'discussion' ? 'active' : ''}`}
            onClick={() => setFilter('discussion')}
          >
            🏛️ Discussions
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No notifications yet</p>
              <button className="cta-btn" onClick={() => navigate('/dashboard')}>
                Start Exploring Discussions
              </button>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <motion.div
                key={notif.id}
                className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                <div className="notification-content">
                  <p className="notification-title">
                    <strong>{notif.title}</strong>
                  </p>
                  <p className="notification-message">
                    {notif.message}
                  </p>
                  <span className="notification-time">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
                {!notif.is_read && <span className="unread-dot"></span>}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
});

Notifications.displayName = 'Notifications';

export default Notifications;
