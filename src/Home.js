import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import GreekFrieze from './components/GreekFrieze';
import MythIcon from './components/MythIcon';
import ScrollProgress from './components/ScrollProgress';
import authManager from './utils/authManager';
import './Home.css';

/**
 * HOME - THE PARTHENON FRIEZE & ALLEGORY OF THE CAVE
 * Now with UnifiedNavbar and smooth Framer Motion animations
 */

function Home() {
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState(0);
  
  // Smooth scroll progress for Allegory of Cave
  const { scrollYProgress } = useScroll();

  // Philosophical Quotes from Ancient Greeks
  const philosophicalQuotes = [
    {
      text: "The unexamined life is not worth living",
      author: "Socrates",
      greek: "ὁ δὲ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ"
    },
    {
      text: "Know thyself",
      author: "Delphic Oracle",
      greek: "γνῶθι σεαυτόν"
    },
    {
      text: "Wisdom begins in wonder",
      author: "Socrates",
      greek: "ἡ σοφία ἄρχεται ἐν θαυμασμῷ"
    },
    {
      text: "Quality is not an act, it is a habit",
      author: "Aristotle",
      greek: "ἡ ἀρετή ἐστιν ἕξις"
    }
  ];

  // Frieze Figures - Representing community milestones
  const friezeFigures = [
    { icon: '🏛️', label: 'Foundation' },
    { icon: '🦉', label: 'Wisdom' },
    { icon: '💭', label: 'Ideas' },
    { icon: '🤝', label: 'Dialogue' },
    { icon: '📜', label: 'Knowledge' },
    { icon: '🌿', label: 'Growth' },
    { icon: '⚖️', label: 'Justice' },
    { icon: '🔥', label: 'Truth' },
    { icon: '👑', label: 'Excellence' },
  ];

  // Featured Philosophical Topics
  const featuredTopics = [
    {
      id: 1,
      title: "What is the nature of consciousness?",
      excerpt: "Is consciousness a fundamental property of the universe, or does it emerge from complex neural processes?",
      myth: 'athena',
      virtue: 'Wisdom',
      replies: 24
    },
    {
      id: 2,
      title: "The ethics of artificial intelligence",
      excerpt: "As AI becomes more advanced, how should we approach questions of rights, responsibilities, and moral agency?",
      myth: 'hephaestus',
      virtue: 'Craft',
      replies: 18
    },
    {
      id: 3,
      title: "Free will vs determinism",
      excerpt: "Do we truly have free will, or are our choices predetermined by prior causes? Join the philosophical debate.",
      myth: 'apollo',
      virtue: 'Truth',
      replies: 31
    }
  ];

  // Rotate quotes every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % philosophicalQuotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [philosophicalQuotes.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Accessibility: Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Accessibility: ARIA Live Region for Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="announcements"
      >
        {/* Dynamic announcements will be read by screen readers */}
      </div>
      
      <ScrollProgress />
      
      <div className="home-container" id="main-content">
      {/* Enlightenment Progress Bar with Framer Motion */}
      <motion.div 
        className="enlightenment-bar"
        style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
        title="Your journey from shadow to light"
      >
        <span className="torch-icon">
          🔦
        </span>
      </motion.div>

      {/* Hero Section - Parthenon Steps */}
      <section className="hero-parthenon scroll-reveal">
        <div className="hero-background">
          <div className="column-shadow column-1"></div>
          <div className="column-shadow column-2"></div>
          <div className="column-shadow column-3"></div>
          <div className="column-shadow column-4"></div>
        </div>
        
        <div className="hero-content container-golden">
          <div className="hero-main">
            <div className="hero-badge">
              <span>Est. MMXXV</span>
              <span className="badge-separator">•</span>
              <span>Digital Acropolis</span>
            </div>
            
            <h1 className="hero-title text-epigraphic">
              ἈΓΟΡΆ
              <span className="hero-subtitle">The Digital Agora</span>
            </h1>
            
            <p className="hero-tagline">
              From the Shadows of Opinion to the Sunlight of Truth
            </p>
            
            <div className="hero-description">
              <p>
                Step into the sacred space where ancient wisdom meets modern inquiry. 
                Like the philosophers of old Athens, gather in this digital marketplace 
                of ideas to question, debate, and ascend toward enlightenment.
              </p>
            </div>
            
            <div className="hero-cta">
              <button 
                className="cta-btn primary-gold ripple-button glow-on-hover"
                onClick={() => navigate('/register')}
                aria-label="Begin your philosophical journey - Register"
              >
                <span className="btn-icon" aria-hidden="true">🏛️</span>
                <span>Begin Your Odyssey</span>
              </button>
              
              <button 
                className="cta-btn secondary-marble ripple-button hover-lift"
                onClick={() => navigate('/login')}
                aria-label="Enter the platform - Login"
              >
                <span className="btn-icon" aria-hidden="true">🔦</span>
                <span>Enter the Light</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Meander Border */}
        <div className="section-divider meander-pattern"></div>
      </section>

      {/* Panathenaic Procession Frieze */}
      <section className="frieze-section">
        <GreekFrieze 
          title="The Procession of Minds"
          subtitle="Join the eternal march toward wisdom"
          items={friezeFigures}
        />
      </section>

      {/* Philosophical Quote - Rotating Oracle */}
      <section className="oracle-section">
        <div className="container-golden">
          <div className="oracle-wisdom quote-philosophical">
            <div className="quote-content" key={currentQuote}>
              <p className="quote-text">{philosophicalQuotes[currentQuote].text}</p>
              <p className="quote-greek">{philosophicalQuotes[currentQuote].greek}</p>
              <p className="quote-author">— {philosophicalQuotes[currentQuote].author}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Discussions - The Stoa */}
      <section className="stoa-section" id="agora">
        <div className="container-golden">
          <div className="section-header">
            <h2 className="section-title text-epigraphic">
              <MythIcon type="athena" size="large" showLabel={false} />
              Active Philosophical Inquiries
            </h2>
            <p className="section-subtitle">
              Join the dialogue in our digital stoa, where wisdom seekers gather
            </p>
          </div>

          <div className="topics-grid grid-golden">
            {featuredTopics.map((topic, index) => (
              <div 
                key={topic.id} 
                className="topic-card column-ionic scroll-reveal hover-lift" 
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="card-header">
                  <MythIcon type={topic.myth} size="large" showVirtue={true} />
                </div>
                
                <div className="card-body">
                  <h3 className="card-title">{topic.title}</h3>
                  <p className="card-excerpt">{topic.excerpt}</p>
                </div>
                
                <div className="card-footer">
                  <div className="card-meta">
                    <span className="meta-item">
                      💬 {topic.replies} voices
                    </span>
                    <span className="meta-item">
                      🌿 {topic.virtue}
                    </span>
                  </div>
                  
                  <button 
                    className="card-btn ripple-button glow-on-hover"
                    onClick={() => navigate('/register')}
                  >
                    Join Discourse →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy of the Platform - Temple Description */}
      <section className="philosophy-section" id="philosophy">
        <div className="container-golden">
          <div className="philosophy-grid">
            <div className="philosophy-content column-corinthian">
              <h2 className="text-epigraphic">What is AGORA?</h2>
              
              <div className="philosophy-text">
                <p>
                  <strong>AGORA</strong> (Ἀγορά) revives the ancient Athenian marketplace—not of goods, 
                  but of <em>ideas</em>. Here, like Socrates in the shadow of the Parthenon, we pursue 
                  <strong>arete</strong> (ἀρετή—excellence) through dialogue and <strong>eudaimonia</strong> 
                  (εὐδαιμονία—human flourishing).
                </p>
                
                <p>
                  Inspired by Plato's <strong>Allegory of the Cave</strong>, we journey together from 
                  the darkness of unexamined opinion toward the brilliant light of philosophical truth. 
                  Each discussion, each question, each moment of <em>aporia</em> (puzzlement) moves us 
                  closer to wisdom.
                </p>
              </div>

              <div className="virtues-grid">
                <div className="virtue-item">
                  <MythIcon type="torch" size="medium" />
                  <h4>Enlightenment</h4>
                  <p>Journey from shadows to truth</p>
                </div>
                
                <div className="virtue-item">
                  <MythIcon type="lyre" size="medium" />
                  <h4>Harmony</h4>
                  <p>Balanced discourse and reason</p>
                </div>
                
                <div className="virtue-item">
                  <MythIcon type="laurel" size="medium" />
                  <h4>Excellence</h4>
                  <p>Pursuit of arete in thought</p>
                </div>
                
                <div className="virtue-item">
                  <MythIcon type="olive" size="medium" />
                  <h4>Wisdom</h4>
                  <p>Sophia through Socratic method</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Temple Base */}
      <footer className="temple-footer">
        <div className="footer-meander"></div>
        
        <div className="container-golden">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-logo">
                <span className="text-epigraphic">ἈΓΟΡΆ</span>
                <p>A Digital Acropolis for Modern Philosophers</p>
              </div>
              
              <div className="footer-links">
                <a href="#agora">Agora</a>
                <span>•</span>
                <a href="#philosophy">Philosophy</a>
                <span>•</span>
                <a href="#symposium">Symposium</a>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>🏛️ Est. MMXXV • Built on the foundations of Plato and Aristotle</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </motion.div>
  );
}

export default Home;
