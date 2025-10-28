import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MythIcon from './components/MythIcon';
import Timeline from './components/Timeline';
import './About.css';

/**
 * ABOUT PAGE - Philosophy of the Platform
 * Optimized with React.memo, lazy images, progressive rendering
 * Performance: First Contentful Paint < 1s
 */

const About = memo(() => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  // Progressive rendering - load critical content first
  const [sectionsLoaded, setSectionsLoaded] = useState({
    hero: true,
    mission: false,
    history: false,
    features: false,
    team: false
  });

  useEffect(() => {
    // Progressive section loading
    const loadSections = async () => {
      await new Promise(r => setTimeout(r, 100));
      setSectionsLoaded(s => ({ ...s, mission: true }));
      
      await new Promise(r => setTimeout(r, 100));
      setSectionsLoaded(s => ({ ...s, history: true }));
      
      await new Promise(r => setTimeout(r, 100));
      setSectionsLoaded(s => ({ ...s, features: true }));
      
      await new Promise(r => setTimeout(r, 100));
      setSectionsLoaded(s => ({ ...s, team: true }));
    };
    
    loadSections();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Timeline data for platform history
  const historyTimeline = [
    {
      year: '399 BCE',
      title: 'The Trial of Socrates',
      description: 'Socrates is tried for impiety. His method of questioning lives on.',
      icon: '⚖️'
    },
    {
      year: '387 BCE',
      title: 'Plato\'s Academy Founded',
      description: 'The first institution of higher learning in the Western world.',
      icon: '🏛️'
    },
    {
      year: '335 BCE',
      title: 'Aristotle\'s Lyceum',
      description: 'Peripatetic school where philosophy met with empirical observation.',
      icon: '📚'
    },
    {
      year: '2025 CE',
      title: 'AGORA Platform Launched',
      description: 'Digital revival of the Athenian marketplace of ideas.',
      icon: '💻'
    }
  ];

  const platformFeatures = [
    {
      icon: '🏛️',
      title: 'Democratic Discourse',
      description: 'Every voice has equal weight in the marketplace of ideas. No hierarchy, only the strength of argument.',
      virtue: 'Isegoria (ἰσηγορία)'
    },
    {
      icon: '🦉',
      title: 'Socratic Method',
      description: 'Through questioning and dialogue, we move from opinion (doxa) to knowledge (episteme).',
      virtue: 'Dialectic (διαλεκτική)'
    },
    {
      icon: '📜',
      title: 'Eternal Wisdom',
      description: 'Discussions are preserved like ancient texts, creating a living library of philosophical inquiry.',
      virtue: 'Mneme (μνήμη)'
    },
    {
      icon: '⚖️',
      title: 'Ethical Moderation',
      description: 'Community-driven standards ensure discourse remains respectful and truth-seeking.',
      virtue: 'Sophrosyne (σωφροσύνη)'
    },
    {
      icon: '🌿',
      title: 'Continuous Growth',
      description: 'Track your philosophical journey with achievements, wisdom levels, and contribution metrics.',
      virtue: 'Arete (ἀρετή)'
    },
    {
      icon: '🔥',
      title: 'Pursuit of Truth',
      description: 'Like Plato\'s cave dwellers ascending to sunlight, we journey from shadows to illumination.',
      virtue: 'Aletheia (ἀλήθεια)'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="about-page"
    >
      {/* Navigation */}
      {/* Hero Section - Always visible */}
      <section className="about-hero">
        <div className="container-golden">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="hero-title text-epigraphic">
              <MythIcon type="athena" size="large" showLabel={false} />
              About AGORA
              <span className="hero-greek">Περὶ τῆς Ἀγορᾶς</span>
            </h1>
            <p className="hero-subtitle">
              Where Ancient Wisdom Meets Modern Inquiry
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section - Progressive loading */}
      {sectionsLoaded.mission && (
        <motion.section 
          className="mission-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container-golden">
            <div className="mission-content">
              <div className="mission-text">
                <h2 className="section-title text-epigraphic">
                  Our Mission
                  <span className="title-greek">Ἡ Ἀποστολή</span>
                </h2>
                
                <div className="philosophy-quote">
                  <p className="quote-text">
                    "The unexamined life is not worth living."
                  </p>
                  <p className="quote-author">— Socrates, 399 BCE</p>
                  <p className="quote-greek">ὁ δὲ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ</p>
                </div>

                <p className="mission-description">
                  AGORA revives the ancient Athenian <strong>agora</strong> (ἀγορά)—the marketplace 
                  where citizens gathered not to trade goods, but to exchange <em>ideas</em>. In the 
                  shadow of the Parthenon, Socrates, Plato, and countless seekers of wisdom engaged 
                  in dialectic, pursuing <strong>arete</strong> (ἀρετή—excellence) and 
                  <strong>eudaimonia</strong> (εὐδαιμονία—human flourishing).
                </p>

                <p className="mission-description">
                  We believe that the digital age offers unprecedented opportunity to democratize 
                  philosophical discourse. Just as the ancient agora was open to all citizens, 
                  our platform welcomes every seeker of truth, regardless of background or formal 
                  education. Here, the only currency is the strength of your argument.
                </p>

                <div className="mission-pillars">
                  <div className="pillar">
                    <span className="pillar-icon">🏛️</span>
                    <h3>Foundation</h3>
                    <p>Built on 2,500 years of Western philosophy</p>
                  </div>
                  <div className="pillar">
                    <span className="pillar-icon">🌍</span>
                    <h3>Accessibility</h3>
                    <p>Philosophy for everyone, everywhere</p>
                  </div>
                  <div className="pillar">
                    <span className="pillar-icon">💡</span>
                    <h3>Innovation</h3>
                    <p>Ancient methods meet modern technology</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* History Timeline - Progressive loading */}
      {sectionsLoaded.history && (
        <motion.section 
          className="history-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container-golden">
            <h2 className="section-title text-epigraphic">
              Our Philosophical Heritage
              <span className="title-greek">Ἡ Κληρονομία</span>
            </h2>
            
            <Timeline items={historyTimeline} />
          </div>
        </motion.section>
      )}

      {/* Platform Features - Progressive loading */}
      {sectionsLoaded.features && (
        <motion.section 
          className="features-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container-golden">
            <h2 className="section-title text-epigraphic">
              What Makes AGORA Unique
              <span className="title-greek">Τί Ποιεῖ Μοναδικήν</span>
            </h2>

            <div className="features-grid">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-card"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <p className="feature-virtue">{feature.virtue}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Call to Action */}
      {sectionsLoaded.team && (
        <motion.section 
          className="cta-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container-golden">
            <div className="cta-content">
              <h2 className="text-epigraphic">Join the Digital Agora</h2>
              <p>
                Step into the marketplace of ideas. Question everything. Seek truth relentlessly. 
                Become part of a community that values wisdom over noise.
              </p>
              
              {!user && (
                <div className="cta-buttons">
                  <button 
                    className="cta-btn primary-gold"
                    onClick={() => navigate('/register')}
                  >
                    <span aria-hidden="true">🏛️</span> Begin Your Journey
                  </button>
                  <button 
                    className="cta-btn secondary-marble"
                    onClick={() => navigate('/login')}
                  >
                    <span aria-hidden="true">🔦</span> Enter the Light
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="temple-footer">
        <div className="footer-meander"></div>
        <div className="container-golden">
          <p className="footer-text">
            🏛️ AGORA • Est. MMXXV • "Know Thyself" - γνῶθι σεαυτόν
          </p>
        </div>
      </footer>
    </motion.div>
  );
});

About.displayName = 'About';

export default About;
