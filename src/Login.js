import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Loading from './components/Loading';
import Toast from './components/Toast';
import config from './config';
import authManager from './utils/authManager';

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Use the new authentication manager
        authManager.setAuth(data.tokens, data.session, data.user);
        
        setToast({ 
          message: `Welcome back, ${data.user.username}! Session active for 1 hour.`, 
          type: 'success' 
        });
        
        setTimeout(() => {
          navigate('/dashboard', { state: { userData: data.user } });
        }, 1500);
      } else {
        setToast({ message: data.message || 'Login failed', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loading message="Consulting the Oracle..." />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="login-container">
        <div className="greek-pattern-bg"></div>
        
        {/* Greek Fire Columns - Eternal Flames of Knowledge */}
        <div className="caryatid-left" title="Eternal Flame of Wisdom">
          <div className="caryatid-figure"></div>
          <div className="column-shaft"></div>
          <div className="column-base"></div>
        </div>
        <div className="caryatid-right" title="Sacred Fire of Knowledge">
          <div className="caryatid-figure"></div>
          <div className="column-shaft"></div>
          <div className="column-base"></div>
        </div>
        
        <div className="login-card">
          <div className="login-header">
            {/* Omphalos - Sacred Navel Stone */}
            <div className="omphalos-container">
              <div className="omphalos-stone">
                <div className="omphalos-icon">🔮</div>
                <div className="omphalos-ring ring-1"></div>
                <div className="omphalos-ring ring-2"></div>
                <div className="omphalos-ring ring-3"></div>
              </div>
            </div>
            <h2>Oracle's Threshold</h2>
            <p className="subtitle">Seek the Path of Wisdom</p>
            <p className="delphic-maxim">« ΓΝΩΘΙ ΣΑΥΤΟΝ » — Know Thyself</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Sacred ID</label>
              <input
                type="text"
                placeholder="AGORA-XXXX"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Secret Phrase</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Entering...' : '⚡ Cross the Threshold'}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-link">
              New Seeker? <a href="/register">Begin Your Journey</a>
            </p>
            <p className="footer-link">
              <a href="/">← Return to Agora</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;