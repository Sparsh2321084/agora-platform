import React from 'react';
import { motion } from 'framer-motion';
import './HamburgerButton.css';

/**
 * Animated Hamburger Menu Button
 * Transforms to X when menu is open
 * 44px touch target for mobile
 */
function HamburgerButton({ isOpen, onClick }) {
  return (
    <button
      className="hamburger-button ripple-button"
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <div className="hamburger-box">
        <motion.div
          className="hamburger-inner"
          animate={isOpen ? 'open' : 'closed'}
          initial={false}
        >
          {/* Top line */}
          <motion.span
            className="hamburger-line"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 8 }
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Middle line */}
          <motion.span
            className="hamburger-line"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Bottom line */}
          <motion.span
            className="hamburger-line"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -8 }
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
    </button>
  );
}

export default HamburgerButton;
