import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import Loading from './components/Loading';
import Toast from './components/Toast';
import config from './config';

function Register() {
  const [username, setUsername] = useState('');
  const [tagline, setTagline] = useState('');
  const [password, setPassword] = useState('');
  const [belief, setBelief] = useState('');
  const [virtue, setVirtue] = useState('');
  const [oathAccepted, setOathAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [generatedId, setGeneratedId] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const checkPasswordStrength = (pass) => {
    // Must match backend requirements: 8+ chars with uppercase, lowercase, number, special
    if (pass.length < 8) return 'weak';
    
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pass);
    
    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteriaMet < 4) return 'weak';
    if (pass.length >= 8 && criteriaMet === 4 && pass.length < 12) return 'medium';
    if (pass.length >= 12 && criteriaMet === 4) return 'strong';
    
    return 'medium';
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    if (pass) {
      setPasswordStrength(checkPasswordStrength(pass));
    } else {
      setPasswordStrength('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Agora ID copied to clipboard!', type: 'success' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch(`${config.API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, tagline, password })
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedId(data.userId);
        setToast({ message: `Welcome! Your Agora ID is ${data.userId}`, type: 'success' });
        
        // Save userId to localStorage for auto-login
        localStorage.setItem('agoraUserId', data.userId);
        
        setTimeout(() => {
          navigate('/belief', { state: { userId: data.userId, username } });
        }, 2000);
      } else {
        setToast({ message: data.message || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loading message="The Oracle is consulting the Fates..." />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="register-container">
        {/* Greek Fire Columns - Eternal Flames of Initiation */}
        <div className="caryatid-left" title="Eternal Flame of New Beginnings">
          <div className="caryatid-figure"></div>
          <div className="column-shaft"></div>
          <div className="column-base"></div>
        </div>
        <div className="caryatid-right" title="Sacred Fire of Transformation">
          <div className="caryatid-figure"></div>
          <div className="column-shaft"></div>
          <div className="column-base"></div>
        </div>

        {generatedId ? (
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h3>Oracle's Blessing</h3>
            <p className="agora-id-label">Your Sacred Identity:</p>
            <div className="agora-id-display">
              <span className="agora-id">{generatedId}</span>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(generatedId)}
                type="button"
              >
                📋 Copy
              </button>
            </div>
            <p className="info-text">Guard this sacred ID - it is your key to the threshold!</p>
          </div>
        ) : (
          <div className="register-card">
            <div className="register-header">
              {/* Omphalos - Sacred Navel Stone */}
              <div className="omphalos-container">
                <div className="omphalos-stone">
                  <div className="omphalos-icon">✨</div>
                  <div className="omphalos-ring ring-1"></div>
                  <div className="omphalos-ring ring-2"></div>
                  <div className="omphalos-ring ring-3"></div>
                </div>
              </div>
              <h2>Rite of Entry</h2>
              <p className="subtitle">Carve Your Name into the Marble of Discourse</p>
              <p className="delphic-maxim">« ΜΗΔΕΝ ΑΓΑΝ » — Nothing in Excess</p>
              <div className="step-indicator">Sacred Initiation • Step I of III</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="As you wish to be known in the Agora..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  minLength={3}
                />
                <small className="helper-text">Your identity etched in stone for eternity</small>
              </div>

              <div className="form-group">
                <label>Sacred Motto</label>
                <input
                  type="text"
                  placeholder="A phrase that embodies your philosophical quest..."
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  required
                />
                <small className="helper-text">Written on papyrus scroll, your guiding principle</small>
              </div>

              <div className="form-group">
                <label>Secret Phrase</label>
                <input
                  type="password"
                  placeholder="Guard your wisdom with a sacred seal..."
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  maxLength={128}
                  aria-describedby="password-requirements"
                />
                {passwordStrength && (
                  <div className={`password-strength ${passwordStrength}`}>
                    <div className="strength-bar"></div>
                    <span className="strength-text">
                      {passwordStrength === 'weak' && '⚠️ Weak Seal - Requirements not met'}
                      {passwordStrength === 'medium' && '✓ Secure Seal - Good protection'}
                      {passwordStrength === 'strong' && '✓✓ Unbreakable Seal - Excellent!'}
                    </span>
                  </div>
                )}
                <small id="password-requirements" className="helper-text">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </small>
              </div>

              <div className="form-group">
                <label>Philosophical Stance</label>
                <select 
                  value={belief} 
                  onChange={e => setBelief(e.target.value)}
                  required
                >
                  <option value="">Choose your initial compass...</option>
                  <option value="Stoic">🏛️ Stoic — Master of Self</option>
                  <option value="Epicurean">🌿 Epicurean — Seeker of Tranquility</option>
                  <option value="Skeptic">🔍 Skeptic — Questioner of Truth</option>
                  <option value="Platonist">✨ Platonist — Believer in Forms</option>
                  <option value="Aristotelian">📖 Aristotelian — Empirical Thinker</option>
                  <option value="Cynic">⚡ Cynic — Challenger of Convention</option>
                  <option value="Agnostic">❓ Agnostic — Open Seeker</option>
                  <option value="Existentialist">🎭 Existentialist — Creator of Meaning</option>
                </select>
                <small className="helper-text">Your compass in philosophical waters (can evolve)</small>
              </div>

              <div className="form-group">
                <label>Guiding Virtue</label>
                <select 
                  value={virtue} 
                  onChange={e => setVirtue(e.target.value)}
                  required
                >
                  <option value="">Select your cardinal virtue...</option>
                  <option value="Wisdom">🦉 Wisdom (Σοφία) — Knowledge & Understanding</option>
                  <option value="Courage">⚔️ Courage (Ανδρεία) — Moral Bravery</option>
                  <option value="Temperance">⚖️ Temperance (Σωφροσύνη) — Self-Mastery</option>
                  <option value="Justice">⚖️ Justice (Δικαιοσύνη) — Fairness & Honor</option>
                </select>
                <small className="helper-text">The virtue that guides your path in the Agora</small>
              </div>

              {/* Philosopher's Oath */}
              <div className="oath-container">
                <label className="oath-label">
                  <input
                    type="checkbox"
                    className="oath-checkbox"
                    checked={oathAccepted}
                    onChange={e => setOathAccepted(e.target.checked)}
                    required
                  />
                  <div className="oath-text">
                    I vow to speak with clarity, listen with humility, and sculpt my beliefs with reason. 
                    I shall honor the sacred exchange of ideas and uphold the dignity of discourse in this eternal Agora.
                  </div>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading || !oathAccepted}>
                {loading ? 'Consulting Oracle...' : 'Ignite Your Journey'}
              </button>

              <div className="register-footer">
                <p className="footer-link">
                  Already Initiated? <a href="/login">Enter the Threshold</a>
                </p>
                <p className="footer-link">
                  <a href="/">← Return to Agora Gates</a>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default Register;
