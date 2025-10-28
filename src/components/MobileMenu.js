import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './MobileMenu.css';

/**
 * Mobile Navigation Menu Component
 * Hamburger menu with slide-in drawer
 * Touch-optimized with proper accessibility
 */
function MobileMenu({ isOpen, onClose, currentPath = '/' }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { path: '/', label: 'Home', icon: '�' },
    { path: '/dashboard', label: 'Discussions', icon: '💬' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/notifications', label: 'Notifications', icon: '�' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
    { path: '/profile', label: 'Profile', icon: '�' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    },
    exit: { 
      x: '100%',
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300
      }
    }
  };

  const itemVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="mobile-menu-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.nav
            className="mobile-menu-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            {/* Header */}
            <div className="mobile-menu-header">
              <div className="mobile-menu-title">
                <span className="menu-icon">🏛️</span>
                <span className="menu-text">AGORA</span>
                <span className="menu-greek">Ἀγορά</span>
              </div>
              
              <button
                className="mobile-menu-close ripple-button"
                onClick={onClose}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Divider */}
            <div className="mobile-menu-divider"></div>

            {/* Menu Items */}
            <ul className="mobile-menu-list">
              {menuItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className={currentPath === item.path ? 'active' : ''}
                >
                  <button
                    className="mobile-menu-item ripple-button"
                    onClick={() => handleNavigation(item.path)}
                    aria-current={currentPath === item.path ? 'page' : undefined}
                  >
                    <span className="menu-item-icon">{item.icon}</span>
                    <span className="menu-item-label">{item.label}</span>
                    {currentPath === item.path && (
                      <span className="menu-item-active">●</span>
                    )}
                  </button>
                </motion.li>
              ))}
            </ul>

            {/* Footer Quote */}
            <div className="mobile-menu-footer">
              <p className="menu-quote">
                "Know thyself"
                <span className="menu-quote-greek">γνῶθι σεαυτόν</span>
              </p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
