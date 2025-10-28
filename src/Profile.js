import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile-Greek.css';
import Toast from './components/Toast';
import ScrollProgress from './components/ScrollProgress';
import AnimatedCounter from './components/AnimatedCounter';
import config from './config';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('agoraUser') || '{}'));
  const [discussions, setDiscussions] = useState([]);
  // const [loading, setLoading] = useState(true); // Removed unused variable
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('mosaic'); // mosaic, lineage, virtues, footprint, journal
  const [editData, setEditData] = useState({
    username: user.username || '',
    tagline: user.tagline || '',
  });
  
  // Virtue scores (can be calculated from user activity)
  const [virtueScores, setVirtueScores] = useState({
    wisdom: 75,
    courage: 60,
    temperance: 85,
    justice: 70
  });
  
  // Belief evolution data
  const [beliefHistory, setBeliefHistory] = useState(() => {
    const saved = localStorage.getItem(`beliefHistory_${user.userId}`);
    return saved ? JSON.parse(saved) : [
      { id: 1, belief: 'Agnostic', date: '2024-01-15', reason: 'Initial stance' },
      { id: 2, belief: 'Skeptical Empiricist', date: '2024-06-20', reason: 'After studying epistemology' },
      { id: 3, belief: user.belief || 'Agnostic', date: '2024-10-27', reason: 'Current position' }
    ];
  });
  
  // Belief modal state
  const [showBeliefModal, setShowBeliefModal] = useState(false);
  const [editingBelief, setEditingBelief] = useState(null);
  const [beliefForm, setBeliefForm] = useState({
    belief: '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Philosopher modal state
  const [selectedPhilosopher, setSelectedPhilosopher] = useState(null);
  
  // Journal entries
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem(`journal_${user.userId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentJournalText, setCurrentJournalText] = useState('');

  useEffect(() => {
    if (!user.userId) {
      navigate('/login');
      return;
    }
    fetchUserDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserDiscussions = async () => {
    // setLoading(true); // Removed - loading state not needed
    try {
      const res = await fetch(`${config.API_URL}/discussions`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        // Filter discussions by current user
        const userDiscussions = data.filter(disc => disc.user_id === user.userId);
        setDiscussions(userDiscussions);
      } else {
        // No discussions or error response
        setDiscussions([]);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    }
    // finally {
    //   setLoading(false); // Removed - loading state not needed
    // }
  };

  const handleSaveProfile = () => {
    // Update localStorage
    const updatedUser = { ...user, ...editData };
    localStorage.setItem('agoraUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditMode(false);
    setToast({ message: 'Profile updated successfully!', type: 'success' });
  };

  // Removed unused handleLogout function - using navbar logout instead

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
  // Calculate virtue from activity - Memoized to prevent unnecessary recalculations
  useEffect(() => {
    if (discussions.length > 0) {
      const totalReplies = discussions.reduce((acc, d) => acc + (d.replies || 0), 0);
      const totalViews = discussions.reduce((acc, d) => acc + (d.views || 0), 0);
      
      // Only update if values actually changed
      const newScores = {
        wisdom: Math.min(100, 50 + discussions.length * 5),
        courage: Math.min(100, 40 + totalReplies * 2),
        temperance: Math.min(100, 60 + (discussions.length * 3)),
        justice: Math.min(100, 55 + Math.floor(totalViews / 10))
      };
      
      // Prevent unnecessary re-renders
      setVirtueScores(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newScores)) return prev;
        return newScores;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussions.length]); // Only re-run when discussion count changes
  
  // Belief Management Functions
  const handleAddBelief = () => {
    setEditingBelief(null);
    setBeliefForm({
      belief: '',
      reason: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowBeliefModal(true);
  };
  
  const handleEditBelief = (belief) => {
    setEditingBelief(belief);
    setBeliefForm({
      belief: belief.belief,
      reason: belief.reason,
      date: belief.date
    });
    setShowBeliefModal(true);
  };
  
  const handleSaveBelief = () => {
    if (!beliefForm.belief.trim()) {
      setToast({ message: 'Please enter a belief', type: 'error' });
      return;
    }
    
    let updatedHistory;
    if (editingBelief) {
      updatedHistory = beliefHistory.map(b => 
        b.id === editingBelief.id ? { ...beliefForm, id: b.id } : b
      );
      setToast({ message: 'Belief updated successfully!', type: 'success' });
    } else {
      const newBelief = {
        ...beliefForm,
        id: Date.now()
      };
      updatedHistory = [...beliefHistory, newBelief];
      setToast({ message: 'New belief added!', type: 'success' });
    }
    
    setBeliefHistory(updatedHistory);
    localStorage.setItem(`beliefHistory_${user.userId}`, JSON.stringify(updatedHistory));
    setShowBeliefModal(false);
  };
  
  const handleDeleteBelief = (beliefId) => {
    if (window.confirm('Are you sure you want to remove this belief from your mosaic?')) {
      const updatedHistory = beliefHistory.filter(b => b.id !== beliefId);
      setBeliefHistory(updatedHistory);
      localStorage.setItem(`beliefHistory_${user.userId}`, JSON.stringify(updatedHistory));
      setToast({ message: 'Belief removed from mosaic', type: 'success' });
    }
  };
  
  // Philosopher Data
  const philosophers = {
    socrates: {
      name: 'Socrates',
      icon: '🗿',
      dates: '470-399 BCE',
      school: 'Classical Greek Philosophy',
      bio: 'Father of Western philosophy, known for the Socratic method of questioning to stimulate critical thinking.',
      keyIdeas: ['Know thyself', 'The unexamined life is not worth living', 'I know that I know nothing'],
      influence: 'Pioneered dialectic reasoning and ethical inquiry'
    },
    plato: {
      name: 'Plato',
      icon: '🎭',
      dates: '428-348 BCE',
      school: 'Platonism',
      bio: 'Student of Socrates, founded the Academy in Athens. Developed theory of Forms and ideal state.',
      keyIdeas: ['Theory of Forms', 'Allegory of the Cave', 'The Republic'],
      influence: 'Laid foundation for Western philosophy and political theory'
    },
    aristotle: {
      name: 'Aristotle',
      icon: '📖',
      dates: '384-322 BCE',
      school: 'Aristotelianism',
      bio: 'Student of Plato, tutor to Alexander the Great. Systematized logic and natural sciences.',
      keyIdeas: ['Golden Mean', 'Four Causes', 'Virtue Ethics'],
      influence: 'Shaped medieval scholarship and scientific method'
    },
    epicurus: {
      name: 'Epicurus',
      icon: '🌿',
      dates: '341-270 BCE',
      school: 'Epicureanism',
      bio: 'Founded school teaching that pleasure and absence of pain are the greatest goods.',
      keyIdeas: ['Atomic theory', 'Pleasure as the good', 'Absence of fear'],
      influence: 'Influenced modern scientific materialism'
    }
  };
  
  // Journal Functions
  const handleSaveJournal = () => {
    if (!currentJournalText.trim()) {
      setToast({ message: 'Please write something first', type: 'error' });
      return;
    }
    
    const newEntry = {
      id: Date.now(),
      text: currentJournalText,
      date: new Date().toISOString(),
      published: false
    };
    
    const updatedEntries = [newEntry, ...journalEntries];
    setJournalEntries(updatedEntries);
    localStorage.setItem(`journal_${user.userId}`, JSON.stringify(updatedEntries));
    setCurrentJournalText('');
    setToast({ message: 'Journal entry saved!', type: 'success' });
  };
  
  const handlePublishJournal = () => {
    if (!currentJournalText.trim()) {
      setToast({ message: 'Please write something to publish', type: 'error' });
      return;
    }
    setToast({ message: 'Journal published as discussion! (Feature coming soon)', type: 'success' });
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ScrollProgress />
      
      <div className="profile-page philosophical-portrait">
        {/* Laurel Wreath Decorations */}
        <div className="laurel-decoration laurel-left">🌿</div>
        <div className="laurel-decoration laurel-right">🌿</div>
        
        <div className="profile-container">
          {/* Profile Header - Marble Tablet */}
          <div className="profile-header marble-relief">
            {/* Ornate Frieze Border */}
            <div className="frieze-pattern top"></div>
            
            {/* Profile Avatar with Laurel Wreath */}
            <div className="profile-avatar-section">
              <div className="laurel-wreath-border">
                <div className="profile-avatar-large">
                  <div className="owl-icon">🦉</div>
                  <div className="avatar-circle">
                    <span className="avatar-initial">{user.username?.charAt(0).toUpperCase() || 'Φ'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="profile-info-header">
              {editMode ? (
                <>
                  <input
                    type="text"
                    className="edit-input engraved-input"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    placeholder="Your name"
                  />
                  <input
                    type="text"
                    className="edit-input engraved-input"
                    value={editData.tagline}
                    onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                    placeholder="Your philosophical motto"
                  />
                  <div className="edit-buttons">
                    <button className="save-btn classical-btn" onClick={handleSaveProfile}>
                      <span className="btn-icon">âœ“</span> Save Changes
                    </button>
                    <button className="cancel-btn classical-btn" onClick={() => setEditMode(false)}>
                      <span className="btn-icon">âœ•</span> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="marble-engraved">{user.username}</h1>
                  <p className="philosopher-title">{user.tagline || 'A seeker of wisdom in the Agora'}</p>
                  <div className="philosophical-badges">
                    <span className="badge-item"><span className="icon">🏛️</span> Philosopher</span>
                    <span className="badge-item"><span className="icon">📜</span> {discussions.length} Scrolls</span>
                    <span className="badge-item"><span className="icon">⚖️</span> {user.belief || 'Truth Seeker'}</span>
                  </div>
                  <button className="edit-profile-btn classical-btn" onClick={() => setEditMode(true)}>
                    <span className="btn-icon">âœï¸</span> Edit Portrait
                  </button>
                </>
              )}
            </div>
            
            <div className="frieze-pattern bottom"></div>
          </div>

          {/* Navigation Tabs - Greek Columns */}
          <div className="profile-tabs temple-columns">
            <button 
              className={`tab-column ${activeTab === 'mosaic' ? 'active' : ''}`}
              onClick={() => setActiveTab('mosaic')}
            >
              <span className="column-capital">🏛️</span>
              <span className="column-label">Belief Mosaic</span>
            </button>
            <button 
              className={`tab-column ${activeTab === 'lineage' ? 'active' : ''}`}
              onClick={() => setActiveTab('lineage')}
            >
              <span className="column-capital">🌳</span>
              <span className="column-label">Intellectual Lineage</span>
            </button>
            <button 
              className={`tab-column ${activeTab === 'virtues' ? 'active' : ''}`}
              onClick={() => setActiveTab('virtues')}
            >
              <span className="column-capital">⚖️</span>
              <span className="column-label">Virtue Scoreboard</span>
            </button>
            <button 
              className={`tab-column ${activeTab === 'footprint' ? 'active' : ''}`}
              onClick={() => setActiveTab('footprint')}
            >
              <span className="column-capital">👣</span>
              <span className="column-label">Agora Footprint</span>
            </button>
            <button 
              className={`tab-column ${activeTab === 'journal' ? 'active' : ''}`}
              onClick={() => setActiveTab('journal')}
            >
              <span className="column-capital">📜</span>
              <span className="column-label">Thought Journal</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-content-area">
            
            {/* 1. BELIEF MOSAIC */}
            {activeTab === 'mosaic' && (
              <div className="belief-mosaic-section animated-entrance">
                <h2 className="section-title">
                  <span className="title-icon">🎨</span>
                  Your Philosophical Mosaic
                  <span className="subtitle-greek">μωσαϊκό της Σοφίας</span>
                </h2>
                
                <div className="mosaic-grid">
                  {beliefHistory.map((item, index) => (
                    <div key={item.id} className="mosaic-tile tessera scroll-reveal hover-lift" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="tile-header">
                        <span className="tile-icon">🏺</span>
                        <span className="tile-date">{formatDate(item.date)}</span>
                      </div>
                      <h3 className="tile-belief">{item.belief}</h3>
                      <p className="tile-reason">{item.reason}</p>
                      <div className="tile-divider"></div>
                      <div className="tile-actions">
                        <button 
                          className="tile-edit-btn ripple-button" 
                          onClick={() => handleEditBelief(item)}
                          title="Edit belief"
                        >
                          âœï¸
                        </button>
                        <button 
                          className="tile-delete-btn ripple-button" 
                          onClick={() => handleDeleteBelief(item.id)}
                          title="Remove belief"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mosaic-tile add-belief tessera scroll-reveal hover-lift">
                    <button className="add-belief-btn ripple-button" onClick={handleAddBelief}>
                      <span className="add-icon">âž•</span>
                      <span>Add New Belief</span>
                    </button>
                  </div>
                </div>
                
                <div className="belief-sculptor-section">
                  <h3 className="sculptor-title">
                    <span className="icon">🔨</span> Belief Sculptor
                  </h3>
                  <p className="sculptor-desc">Shape and refine your philosophical stance with historical context</p>
                  <div className="sculptor-current">
                    <label>Current Belief:</label>
                    <div className="belief-display">{user.belief || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 2. INTELLECTUAL LINEAGE */}
            {activeTab === 'lineage' && (
              <div className="lineage-section animated-entrance">
                <h2 className="section-title">
                  <span className="title-icon">🌳</span>
                  Your Intellectual Lineage
                  <span className="subtitle-greek">Δένδρο της Γνώσης</span>
                </h2>
                
                <div className="lineage-tree">
                  <div className="tree-branch">
                    <h3 className="branch-title">
                      <span className="branch-icon">📚</span> Dialogues Joined
                    </h3>
                    <div className="branch-count">{discussions.length}</div>
                  </div>
                  
                  <div className="tree-branch">
                    <h3 className="branch-title">
                      <span className="branch-icon">💭</span> Ideas Challenged
                    </h3>
                    <div className="branch-count">{discussions.reduce((acc, d) => acc + (d.replies || 0), 0)}</div>
                  </div>
                  
                  <div className="tree-branch">
                    <h3 className="branch-title">
                      <span className="branch-icon">âœ¨</span> Virtues Explored
                    </h3>
                    <div className="branch-count">{(user.categories || []).length}</div>
                  </div>
                </div>
                
                <div className="influenced-by-section">
                  <h3 className="influence-title">Influenced By</h3>
                  <div className="philosopher-icons">
                    {Object.keys(philosophers).map((key, index) => {
                      const phil = philosophers[key];
                      return (
                        <div 
                          key={key}
                          className="philosopher-card clickable scroll-reveal hover-lift" 
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onClick={() => setSelectedPhilosopher(phil)}
                          title={`Learn about ${phil.name}`}
                        >
                          <div className="philosopher-bust">{phil.icon}</div>
                          <span>{phil.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* 3. VIRTUE SCOREBOARD */}
            {activeTab === 'virtues' && (
              <div className="virtue-section animated-entrance">
                <h2 className="section-title">
                  <span className="title-icon">âš–ï¸</span>
                  Virtue Scoreboard
                  <span className="subtitle-greek">Î Î¯Î½Î±ÎºÎ±Ï‚ Î‘ÏÎµÏ„ÏŽÎ½</span>
                </h2>
                
                <p className="virtue-description">
                  Track your philosophical virtues through thoughtful engagement, balanced debate, and reflective practice.
                </p>
                
                <div className="virtues-grid">
                  <div className="virtue-card wisdom scroll-reveal hover-lift">
                    <div className="virtue-icon">🦉</div>
                    <h3 className="virtue-name">Wisdom</h3>
                    <p className="virtue-greek">Σοφία</p>
                    <div className="virtue-bar">
                      <div className="virtue-progress" style={{width: `${virtueScores.wisdom}%`}}></div>
                    </div>
                    <p className="virtue-score"><AnimatedCounter end={virtueScores.wisdom} />%</p>
                  </div>
                  
                  <div className="virtue-card courage scroll-reveal hover-lift" style={{ animationDelay: '0.1s' }}>
                    <div className="virtue-icon">âš”ï¸</div>
                    <h3 className="virtue-name">Courage</h3>
                    <p className="virtue-greek">Î‘Î½Î´ÏÎµÎ¯Î±</p>
                    <div className="virtue-bar">
                      <div className="virtue-progress" style={{width: `${virtueScores.courage}%`}}></div>
                    </div>
                    <span className="virtue-score"><AnimatedCounter end={virtueScores.courage} />%</span>
                  </div>
                  
                  <div className="virtue-card temperance scroll-reveal hover-lift" style={{ animationDelay: '0.2s' }}>
                    <div className="virtue-icon">âš–ï¸</div>
                    <h3 className="virtue-name">Temperance</h3>
                    <p className="virtue-greek">Î£Ï‰Ï†ÏÎ¿ÏƒÏÎ½Î·</p>
                    <div className="virtue-bar">
                      <div className="virtue-progress" style={{width: `${virtueScores.temperance}%`}}></div>
                    </div>
                    <span className="virtue-score"><AnimatedCounter end={virtueScores.temperance} />%</span>
                  </div>
                  
                  <div className="virtue-card justice scroll-reveal hover-lift" style={{ animationDelay: '0.3s' }}>
                    <div className="virtue-icon">âš–ï¸</div>
                    <h3 className="virtue-name">Justice</h3>
                    <p className="virtue-greek">Î”Î¹ÎºÎ±Î¹Î¿ÏƒÏÎ½Î·</p>
                    <div className="virtue-bar">
                      <div className="virtue-progress" style={{width: `${virtueScores.justice}%`}}></div>
                    </div>
                    <span className="virtue-score"><AnimatedCounter end={virtueScores.justice} />%</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 4. AGORA FOOTPRINT */}
            {activeTab === 'footprint' && (
              <div className="footprint-section animated-entrance">
                <h2 className="section-title">
                  <span className="title-icon">👣</span>
                  Your Agora Footprint
                  <span className="subtitle-greek">Αποτύπωμα στην Αγορά</span>
                </h2>
                
                <div className="timeline-wall">
                  {discussions.slice(0, 5).map((disc, index) => (
                    <div key={disc.id} className="timeline-entry carved-stone scroll-reveal" style={{animationDelay: `${index * 0.15}s`}}>
                      <div className="timeline-date">{formatDate(disc.created_at)}</div>
                      <div className="timeline-icon">📜</div>
                      <div className="timeline-content">
                        <h4 className="timeline-title">{disc.title}</h4>
                        <p className="timeline-category">{disc.category || 'General'}</p>
                        <div className="timeline-stats">
                          <span>💬 {disc.replies || 0}</span>
                          <span>👁️ {disc.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {discussions.length === 0 && (
                    <div className="no-footprint">
                      <p>Your journey in the Agora begins here...</p>
                      <button className="start-journey-btn" onClick={() => navigate('/dashboard')}>
                        Start Your First Discussion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 5. THOUGHT JOURNAL */}
            {activeTab === 'journal' && (
              <div className="journal-section animated-entrance">
                <h2 className="section-title">
                  <span className="title-icon">📜</span>
                  Thought Journal
                  <span className="subtitle-greek">Ημερολόγιο Σκέψης</span>
                </h2>
                
                <div className="journal-scroll">
                  <div className="scroll-header">
                    <h3>Private Reflections</h3>
                    <button className="publish-scroll-btn" onClick={handlePublishJournal}>
                      <span className="icon">📯</span> Publish as Scroll
                    </button>
                  </div>
                  
                  <textarea 
                    className="journal-textarea parchment"
                    placeholder="Write your philosophical reflections here... These are your private thoughts unless you choose to publish them as a scroll."
                    rows="10"
                    value={currentJournalText}
                    onChange={(e) => setCurrentJournalText(e.target.value)}
                  ></textarea>
                  
                  <div className="journal-actions">
                    <button className="save-entry-btn" onClick={handleSaveJournal}>
                      <span className="icon">💾</span> Save Entry
                    </button>
                  </div>
                  
                  {/* Saved Journal Entries */}
                  {journalEntries.length > 0 && (
                    <div className="saved-entries">
                      <h4>📚 Saved Entries</h4>
                      {journalEntries.slice(0, 5).map(entry => (
                        <div key={entry.id} className="journal-entry-card">
                          <div className="entry-date">{formatDate(entry.date)}</div>
                          <p className="entry-text">{entry.text.substring(0, 150)}...</p>
                          <div className="entry-actions">
                            <button
                              className="view-btn"
                              onClick={() => {
                                setCurrentJournalText(entry.text);
                                setToast({ message: 'Entry loaded for editing', type: 'success' });
                              }}
                            >
                              👁️ View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="oracle-insights">
                  <h3 className="oracle-title">
                    <span className="icon">🔮</span> Oracle Insights
                  </h3>
                  <div className="insight-card">
                    <p className="insight-text">
                      "Your belief trajectory shows a movement from skepticism towards empirical wisdom. 
                      Continue engaging with epistemology discussions to deepen your understanding."
                    </p>
                    <span className="oracle-signature">â€” The Oracle</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Details - Secondary Info */}
          <div className="profile-details secondary-tablets">
            <div className="detail-card tablet">
              <div className="tablet-seal">🏺</div>
              <h3>Current Belief</h3>
              <p className="belief-text carved">{user.belief || 'Not specified'}</p>
            </div>

            <div className="detail-card tablet">
              <div className="tablet-seal">📚</div>
              <h3>Areas of Interest</h3>
              <div className="categories-list">
                {(user.categories || []).length > 0 ? (
                  user.categories.map((cat, index) => (
                    <span key={index} className="category-tag pottery">{cat}</span>
                  ))
                ) : (
                  <p className="empty-state">No philosophical domains selected</p>
                )}
              </div>
            </div>

            <div className="detail-card tablet">
              <div className="tablet-seal">📊</div>
              <h3>Contribution Stats</h3>
              <div className="stats-grid pillars">
                <div className="stat-item pillar">
                  <div className="stat-icon">🏛️</div>
                  <div className="stat-number">{discussions.length}</div>
                  <div className="stat-label">Discussions</div>
                </div>
                <div className="stat-item pillar">
                  <div className="stat-icon">💬</div>
                  <div className="stat-number">{discussions.reduce((acc, d) => acc + (d.replies || 0), 0)}</div>
                  <div className="stat-label">Replies</div>
                </div>
                <div className="stat-item pillar">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-number">{discussions.reduce((acc, d) => acc + (d.views || 0), 0)}</div>
                  <div className="stat-label">Views</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mirror Mode Toggle */}
          <div className="mirror-mode-section">
            <button className="mirror-mode-btn">
              <span className="icon">🪞</span>
              <span>Mirror Mode</span>
              <span className="tooltip">Compare your profile with another philosopher</span>
            </button>
          </div>
        </div>
        
        {/* Belief Modal */}
        {showBeliefModal && (
          <div className="modal-overlay" onClick={() => setShowBeliefModal(false)}>
            <div className="modal-content belief-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingBelief ? 'âœï¸ Edit Belief' : 'âž• Add New Belief'}</h2>
                <button className="modal-close" onClick={() => setShowBeliefModal(false)}>âœ•</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Belief / Philosophical Stance</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g., Stoic, Existentialist, Utilitarian"
                    value={beliefForm.belief}
                    onChange={(e) => setBeliefForm({...beliefForm, belief: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Reason / Context</label>
                  <textarea
                    className="modal-textarea"
                    placeholder="Why this belief? What influenced this change?"
                    rows="4"
                    value={beliefForm.reason}
                    onChange={(e) => setBeliefForm({...beliefForm, reason: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={beliefForm.date}
                    onChange={(e) => setBeliefForm({...beliefForm, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-btn cancel-btn" onClick={() => setShowBeliefModal(false)}>
                  Cancel
                </button>
                <button className="modal-btn save-btn" onClick={handleSaveBelief}>
                  {editingBelief ? 'Update' : 'Add'} Belief
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Philosopher Modal */}
        {selectedPhilosopher && (
          <div className="modal-overlay" onClick={() => setSelectedPhilosopher(null)}>
            <div className="modal-content philosopher-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <span className="philosopher-icon-large">{selectedPhilosopher.icon}</span>
                  {selectedPhilosopher.name}
                </h2>
                <button className="modal-close" onClick={() => setSelectedPhilosopher(null)}>âœ•</button>
              </div>
              <div className="modal-body">
                <div className="philosopher-details">
                  <div className="detail-row">
                    <strong>📅 Lived:</strong> {selectedPhilosopher.dates}
                  </div>
                  <div className="detail-row">
                    <strong>🏛️ School:</strong> {selectedPhilosopher.school}
                  </div>
                  <div className="detail-row bio">
                    <strong>📖 Biography:</strong>
                    <p>{selectedPhilosopher.bio}</p>
                  </div>
                  <div className="detail-row">
                    <strong>💡 Key Ideas:</strong>
                    <ul>
                      {selectedPhilosopher.keyIdeas.map((idea, i) => (
                        <li key={i}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="detail-row">
                    <strong>âœ¨ Influence:</strong>
                    <p>{selectedPhilosopher.influence}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-btn primary-btn" onClick={() => setSelectedPhilosopher(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;

