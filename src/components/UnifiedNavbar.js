import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authManager from '../utils/authManager';
import './UnifiedNavbar.css';

/**
 * UNIFIED NAVIGATION COMPONENT
 * Industry-standard navigation following Quora/Reddit/Stack Overflow patterns
 * Features: Profile dropdown, notification bell, search modal, concepts menu
 */
function UnifiedNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [conceptsDropdownOpen, setConceptsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authManager.isAuthenticated();
      const storedUser = localStorage.getItem('agoraUser');
      
      setIsLoggedIn(authenticated || !!storedUser);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = (event, data) => {
      if (event === 'login') {
        setIsLoggedIn(true);
        setUser(data);
      } else if (event === 'logout' || event === 'session-expired') {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    authManager.addListener(handleAuthChange);

    return () => {
      authManager.removeListener(handleAuthChange);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
      if (!e.target.closest('.concepts-dropdown-container')) {
        setConceptsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authManager.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const concepts = [
    { name: 'Foundation', path: '/foundation', icon: '🏛️' },
    { name: 'Wisdom', path: '/wisdom', icon: '🦉' },
    { name: 'Ideas', path: '/ideas', icon: '💡' },
    { name: 'Dialogue', path: '/dialogue', icon: '💬' },
    { name: 'Knowledge', path: '/knowledge', icon: '📚' },
    { name: 'Growth', path: '/growth', icon: '🌱' },
    { name: 'Justice', path: '/justice', icon: '⚖️' },
    { name: 'Truth', path: '/truth', icon: '🔍' },
    { name: 'Excellence', path: '/excellence', icon: '⭐' }
  ];

  return (
    <>
      <nav className="unified-navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => navigate('/')}>
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">AGORA</span>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-links desktop-only">
            <button 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              🏠 Home
            </button>

            {isLoggedIn && (
              <button 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                💬 Discussions
              </button>
            )}

            {isLoggedIn && (
              <button 
                className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
                onClick={() => navigate('/leaderboard')}
              >
                🏆 Leaderboard
              </button>
            )}

            {/* Concepts Dropdown */}
            <div className="concepts-dropdown-container">
              <button 
                className="nav-link dropdown-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setConceptsDropdownOpen(!conceptsDropdownOpen);
                }}
              >
                📚 Concepts <span className="dropdown-arrow">{conceptsDropdownOpen ? '▲' : '▼'}</span>
              </button>

              <AnimatePresence>
                {conceptsDropdownOpen && (
                  <motion.div
                    className="concepts-mega-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mega-menu-header">
                      <h3>Philosophical Concepts</h3>
                      <p>Explore timeless ideas</p>
                    </div>
                    <div className="mega-menu-grid">
                      {concepts.map((concept) => (
                        <div
                          key={concept.path}
                          className="concept-item"
                          onClick={() => {
                            navigate(concept.path);
                            setConceptsDropdownOpen(false);
                          }}
                        >
                          <span className="concept-icon">{concept.icon}</span>
                          <span className="concept-name">{concept.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isLoggedIn && (
              <button 
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                onClick={() => navigate('/about')}
              >
                ℹ️ About
              </button>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="navbar-actions">
            {/* Search Icon */}
            <button 
              className="icon-btn" 
              onClick={() => navigate('/search')}
              title="Search"
            >
              🔍
            </button>

            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <button 
                  className="icon-btn notification-btn" 
                  onClick={() => navigate('/notifications')}
                  title="Notifications"
                >
                  🔔
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="profile-dropdown-container">
                  <button
                    className="profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }}
                    aria-label="User menu"
                    aria-expanded={profileDropdownOpen}
                  >
                    <span className="profile-avatar" title={user?.username}>
                      {user?.username?.charAt(0).toUpperCase() || '👤'}
                    </span>
                    <span className="dropdown-arrow">{profileDropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        className="profile-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="dropdown-header">
                          <div className="user-avatar-large">
                            {user?.username?.charAt(0).toUpperCase() || '👤'}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{user?.username || 'User'}</span>
                            <span className="user-id">{user?.userId || 'AGORA-0001'}</span>
                          </div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" onClick={() => { navigate('/profile'); setProfileDropdownOpen(false); }}>
                          <span className="item-icon">👤</span> <span className="item-text">View Profile</span>
                        </button>
                        <button className="dropdown-item" onClick={() => { navigate('/settings'); setProfileDropdownOpen(false); }}>
                          <span className="item-icon">⚙️</span> <span className="item-text">Settings</span>
                        </button>
                        <button className="dropdown-item" onClick={() => { navigate('/about'); setProfileDropdownOpen(false); }}>
                          <span className="item-icon">ℹ️</span> <span className="item-text">About</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                          <span className="item-icon">🚪</span> <span className="item-text">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <button 
                  className="nav-btn secondary" 
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button 
                  className="nav-btn primary" 
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile Hamburger */}
            <button 
              className="hamburger-btn mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="hamburger-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-header">
                <span className="mobile-menu-title">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>

              <div className="mobile-menu-content">
                {isLoggedIn && user && (
                  <div className="mobile-user-info">
                    <div className="mobile-avatar">{user.username?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="mobile-username">{user.username}</div>
                      <div className="mobile-userid">{user.userId}</div>
                    </div>
                  </div>
                )}

                <button className="mobile-menu-item" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                  🏠 Home
                </button>
                
                {isLoggedIn && (
                  <button className="mobile-menu-item" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                    💬 Discussions
                  </button>
                )}

                <button className="mobile-menu-item" onClick={() => { navigate('/search'); setMobileMenuOpen(false); }}>
                  🔍 Search
                </button>

                <div className="mobile-menu-section">
                  <div className="mobile-section-title">Philosophical Concepts</div>
                  {concepts.map((concept) => (
                    <button 
                      key={concept.path}
                      className="mobile-menu-item small" 
                      onClick={() => { navigate(concept.path); setMobileMenuOpen(false); }}
                    >
                      {concept.icon} {concept.name}
                    </button>
                  ))}
                </div>

                {isLoggedIn ? (
                  <>
                    <button className="mobile-menu-item" onClick={() => { navigate('/notifications'); setMobileMenuOpen(false); }}>
                      🔔 Notifications
                      {unreadNotifications > 0 && (
                        <span className="mobile-badge">{unreadNotifications}</span>
                      )}
                    </button>
                    <button className="mobile-menu-item" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                      👤 Profile
                    </button>
                    <button className="mobile-menu-item" onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}>
                      ⚙️ Settings
                    </button>
                    <button className="mobile-menu-item" onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>
                      ℹ️ About
                    </button>
                    <div className="mobile-menu-divider"></div>
                    <button className="mobile-menu-item logout" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button className="mobile-menu-item" onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>
                      ℹ️ About
                    </button>
                    <div className="mobile-menu-divider"></div>
                    <button className="mobile-menu-item" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                      🔐 Login
                    </button>
                    <button className="mobile-menu-item primary" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                      ✨ Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default UnifiedNavbar;
 