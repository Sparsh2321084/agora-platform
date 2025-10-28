import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ConceptPage.css';

/**
 * REUSABLE CONCEPT PAGE TEMPLATE
 * Powers all 9 philosophical concept pages (Foundation, Wisdom, Ideas, etc.)
 * Performance: React.memo, minimal re-renders, CSS containment
 * Navigation: Uses UnifiedNavbar via Layout component
 */

const ConceptPage = memo(({ concept }) => {
  const navigate = useNavigate();
  
  // Get user from localStorage to check authentication status  
  const user = JSON.parse(localStorage.getItem('agoraUser') || 'null');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="concept-page"
    >
      {/* Hero Section */}
      <section className="concept-hero" style={{ background: concept.gradient }}>
        <div className="container-golden">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="hero-icon">{concept.icon}</div>
            <h1 className="hero-title text-epigraphic">
              {concept.title}
              <span className="hero-greek">{concept.greek}</span>
            </h1>
            <p className="hero-tagline">{concept.tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="concept-content">
        <div className="container-golden">
          {/* Quote */}
          <motion.div 
            className="philosophy-quote"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="quote-text">{concept.quote.text}</p>
            <p className="quote-author">— {concept.quote.author}</p>
            {concept.quote.greek && <p className="quote-greek">{concept.quote.greek}</p>}
          </motion.div>

          {/* Definition */}
          <motion.div
            className="concept-definition"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="section-title">What is {concept.title}?</h2>
            {concept.definition.map((para, idx) => (
              <p key={idx} className="definition-text">{para}</p>
            ))}
          </motion.div>

          {/* Key Principles */}
          <motion.div
            className="concept-principles"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="section-title">Key Principles</h2>
            <div className="principles-grid">
              {concept.principles.map((principle, idx) => (
                <motion.div
                  key={idx}
                  className="principle-card"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="principle-icon">{principle.icon}</div>
                  <h3 className="principle-title">{principle.title}</h3>
                  <p className="principle-description">{principle.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Philosophers */}
          {concept.philosophers && (
            <motion.div
              className="concept-philosophers"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="section-title">Who Explored This?</h2>
              <div className="philosophers-grid">
                {concept.philosophers.map((phil, idx) => (
                  <div key={idx} className="philosopher-card">
                    <div className="philosopher-name">{phil.name}</div>
                    <p className="philosopher-contribution">{phil.contribution}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Modern Applications */}
          {concept.modern && (
            <motion.div
              className="concept-modern"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="section-title">Modern Applications</h2>
              <ul className="modern-list">
                {concept.modern.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            className="concept-cta"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h3>Explore {concept.title} in Discussions</h3>
            <p>Join the conversation and apply these principles in practice</p>
            <button 
              className="cta-btn primary-gold"
              onClick={() => navigate(user ? '/dashboard' : '/register')}
            >
              {concept.icon} {user ? 'Browse Discussions' : 'Join AGORA'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="temple-footer">
        <div className="footer-meander"></div>
        <div className="container-golden">
          <p className="footer-text">
            {concept.icon} {concept.title} • AGORA • "Know Thyself" - γνῶθι σεαυτόν
          </p>
        </div>
      </footer>
    </motion.div>
  );
});

ConceptPage.displayName = 'ConceptPage';

export default ConceptPage;
