import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDebounce } from './hooks/useDebounce';
import Toast from './components/Toast';
import './Settings.css';

/**
 * SETTINGS PAGE - User Preferences & Configuration
 * Performance: Debounced inputs, IndexedDB storage, React.memo
 */

const Settings = memo(() => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    theme: 'dark', // dark, light, auto
    emailNotifications: true,
    replyNotifications: true,
    mentionNotifications: true,
    digestFrequency: 'daily', // daily, weekly, never
    language: 'en',
    showGreek: true,
    animationsEnabled: true,
    accessibilityMode: false,
    fontSize: 'medium', // small, medium, large
    privacy: {
      showProfile: true,
      showDiscussions: true,
      showActivity: true
    }
  });

  // Debounced settings for auto-save
  const debouncedSettings = useDebounce(settings, 1000);

  // Load settings from IndexedDB on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadSettings = async () => {
      try {
        const saved = localStorage.getItem(`settings_${user.id}`);
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [user, navigate]);

  // Auto-save settings when changed (debounced)
  useEffect(() => {
    if (!user) return;

    const saveSettings = async () => {
      setSaving(true);
      try {
        localStorage.setItem(`settings_${user.id}`, JSON.stringify(debouncedSettings));
        
        // Apply settings immediately
        document.documentElement.setAttribute('data-theme', debouncedSettings.theme);
        document.documentElement.setAttribute('data-font-size', debouncedSettings.fontSize);
        
        setToast({ message: '⚙️ Settings saved', type: 'success' });
      } catch (error) {
        setToast({ message: '❌ Failed to save settings', type: 'error' });
      } finally {
        setSaving(false);
      }
    };

    saveSettings();
  }, [debouncedSettings, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updatePrivacy = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="settings-page"
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Navigation */}
      {/* Settings Content */}
      <div className="settings-container container-golden">
        <div className="settings-header">
          <h1 className="settings-title text-epigraphic">
            ⚙️ Settings
            <span className="title-greek">Ρυθμίσεις</span>
          </h1>
          {saving && <span className="saving-indicator">💾 Saving...</span>}
        </div>

        {/* Appearance Settings */}
        <section className="settings-section">
          <h2 className="section-title">
            <span className="section-icon">🎨</span>
            Appearance
          </h2>

          <div className="settings-group">
            <label className="setting-label">
              <span>Theme</span>
              <select 
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="setting-select"
              >
                <option value="dark">Dark (Nighttime Agora)</option>
                <option value="light">Light (Marble Temple)</option>
                <option value="auto">Auto (Follow System)</option>
              </select>
            </label>

            <label className="setting-label">
              <span>Font Size</span>
              <select 
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
                className="setting-select"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>

            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.showGreek}
                onChange={(e) => updateSetting('showGreek', e.target.checked)}
              />
              <span>Show Greek Text (Ἑλληνικά)</span>
            </label>

            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
              />
              <span>Enable Animations</span>
            </label>

            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.accessibilityMode}
                onChange={(e) => updateSetting('accessibilityMode', e.target.checked)}
              />
              <span>Accessibility Mode (High Contrast)</span>
            </label>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="settings-section">
          <h2 className="section-title">
            <span className="section-icon">🔔</span>
            Notifications
          </h2>

          <div className="settings-group">
            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
              />
              <span>Email Notifications</span>
            </label>

            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.replyNotifications}
                onChange={(e) => updateSetting('replyNotifications', e.target.checked)}
              />
              <span>Notify on Replies</span>
            </label>

            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.mentionNotifications}
                onChange={(e) => updateSetting('mentionNotifications', e.target.checked)}
              />
              <span>Notify on Mentions</span>
            </label>

            <label className="setting-label">
              <span>Digest Frequency</span>
              <select 
                value={settings.digestFrequency}
                onChange={(e) => updateSetting('digestFrequency', e.target.value)}
                className="setting-select"
              >
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Summary</option>
                <option value="never">Never</option>
              </select>
            </label>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="settings-section">
          <h2 className="section-title">
            <span className="section-icon">🔒</span>
            Privacy
          </h2>

          <div className="settings-group">
            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.privacy.showProfile}
                onChange={(e) => updatePrivacy('showProfile', e.target.checked)}
              />
              <span>Make Profile Public</span>
            </label>

            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.privacy.showDiscussions}
                onChange={(e) => updatePrivacy('showDiscussions', e.target.checked)}
              />
              <span>Show My Discussions</span>
            </label>

            <label className="setting-label checkbox-label">
              <input
                type="checkbox"
                checked={settings.privacy.showActivity}
                onChange={(e) => updatePrivacy('showActivity', e.target.checked)}
              />
              <span>Show Activity Feed</span>
            </label>
          </div>
        </section>

        {/* Account Actions */}
        <section className="settings-section danger-zone">
          <h2 className="section-title">
            <span className="section-icon">⚠️</span>
            Danger Zone
          </h2>

          <div className="settings-group">
            <button className="danger-btn" onClick={() => setToast({ message: '🔄 Password reset coming soon!', type: 'info' })}>
              Reset Password
            </button>
            
            <button className="danger-btn" onClick={() => setToast({ message: '📧 Export feature coming soon!', type: 'info' })}>
              Export My Data
            </button>
            
            <button className="danger-btn critical" onClick={() => setToast({ message: '⚠️ Account deletion coming soon!', type: 'warning' })}>
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
});

Settings.displayName = 'Settings';

export default Settings;
