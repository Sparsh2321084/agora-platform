import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard-Greek.css';
import Toast from './components/Toast';
import ScrollProgress from './components/ScrollProgress';
import AnimatedCounter from './components/AnimatedCounter';
import VoteButton from './components/VoteButton';
import config from './config';
import { useDebounce } from './hooks/useDebounce';
import authManager from './utils/authManager';
import { staleWhileRevalidate } from './utils/cacheStrategies';
import { fadeInUp } from './animations/pageTransitions';

// Memoized Discussion Card Component for better performance
const DiscussionCard = memo(({ disc, index, onNavigate, userId }) => {
  const handleClick = useCallback((e) => {
    // Don't navigate if clicking on vote buttons
    if (e.target.closest('.vote-container')) {
      return;
    }
    onNavigate(`/discussion/${disc.id}`);
  }, [disc.id, onNavigate]);

  const handleJoinClick = useCallback((e) => {
    e.stopPropagation();
    onNavigate(`/discussion/${disc.id}`);
  }, [disc.id, onNavigate]);

  return (
    <div 
      className="discussion-card scroll-reveal hover-lift" 
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleClick}
    >
      <div className="discussion-card-content">
        <div className="discussion-vote-section">
          <VoteButton
            itemId={disc.id}
            itemType="discussion"
            initialScore={disc.score || 0}
            initialUpvotes={disc.upvotes || 0}
            initialDownvotes={disc.downvotes || 0}
            initialUserVote={disc.userVote || null}
            userId={userId}
          />
        </div>
        
        <div className="discussion-main-content">
          <div className="discussion-category-badge">{disc.category || 'General'}</div>
          <div className="tooltip-trigger">
            <h4>{disc.title}</h4>
            <span className="tooltip-content">{disc.content?.substring(0, 150)}...</span>
          </div>
          <p>{disc.content?.substring(0, 100)}...</p>
          <div className="discussion-meta">
            <span>👤 {disc.username}</span>
            <span>💬 {disc.replies || 0}</span>
            <span>👁️ {disc.views || 0}</span>
          </div>
          <button className="join-btn ripple-button" onClick={handleJoinClick}>
            Join Discussion
          </button>
        </div>
      </div>
    </div>
  );
});

DiscussionCard.displayName = 'DiscussionCard';

// Skeleton Loader Component
const SkeletonCard = memo(({ index }) => (
  <div className="discussion-card skeleton" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="skeleton" style={{ width: '120px', height: '24px', marginBottom: '1rem' }}></div>
    <div className="skeleton" style={{ width: '80%', height: '28px', marginBottom: '0.5rem' }}></div>
    <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '1rem' }}></div>
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <div className="skeleton" style={{ width: '80px', height: '20px' }}></div>
      <div className="skeleton" style={{ width: '60px', height: '20px' }}></div>
      <div className="skeleton" style={{ width: '70px', height: '20px' }}></div>
    </div>
    <div className="skeleton" style={{ width: '140px', height: '40px' }}></div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  // Advanced: Debounced search to prevent excessive filtering
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Check authentication status on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      // Check if we have user data in localStorage (fallback for backward compatibility)
      const storedUser = localStorage.getItem('agoraUser');
      if (!storedUser) {
        navigate('/login');
        return;
      }
    }
  }, [navigate]);
  
  // Get user data from navigation state or localStorage
  const defaultUser = {
    userId: localStorage.getItem('agoraUserId') || 'AGORA-0001',
    username: 'Sparsh',
    tagline: 'Seeking truth through dialogue',
    belief: 'Agnostic',
    categories: ['Ethics', 'Free Will', 'Consciousness']
  };

  const user = location.state?.userData || JSON.parse(localStorage.getItem('agoraUser') || JSON.stringify(defaultUser));

  // Memoized categories list
  const categories = useMemo(() => ['All', 'Ethics', 'Free Will', 'Consciousness', 'Epistemology', 'Politics', 'Metaphysics'], []);

  // Optimized fetch with caching (stale-while-revalidate pattern)
  const fetchDiscussions = useCallback(async (page = 1, category = null) => {
    setLoading(true);
    try {
      const cacheKey = `discussions_${page}_${category || 'all'}`;
      
      // Use stale-while-revalidate for better UX
      const data = await staleWhileRevalidate(
        cacheKey,
        async () => {
          let url = `${config.API_URL}/discussions?page=${page}&limit=20`;
          if (category && category !== 'All') {
            url += `&category=${encodeURIComponent(category)}`;
          }
          
          const res = await fetch(url);
          return res.json();
        },
        30000 // 30 seconds cache
      );
      
      if (data.discussions) {
        setDiscussions(data.discussions || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setToast({ message: 'Failed to load discussions', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setToast({ message: 'Network error. Using sample data.', type: 'error' });
      // Use sample data as fallback
      setDiscussions([
        {
          id: 1,
          title: 'Is Free Will an Illusion?',
          content: 'Join the debate on determinism vs. free will.',
          category: 'Free Will',
          username: 'Philosopher',
          replies: 12,
          views: 45
        },
        {
          id: 2,
          title: 'Ethics in Modern Society',
          content: 'Share your thoughts on evolving moral standards.',
          category: 'Ethics',
          username: 'Thinker',
          replies: 8,
          views: 32
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch discussions on mount
  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleCreateDiscussion = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newDiscussion.title || !newDiscussion.content) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          username: user.username,
          title: newDiscussion.title,
          content: newDiscussion.content,
          category: newDiscussion.category || 'General'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: 'Discussion created successfully!', type: 'success' });
        setShowCreateModal(false);
        setNewDiscussion({ title: '', content: '', category: '' });
        fetchDiscussions(); // Refresh discussions
      } else {
        setToast({ message: data.message || 'Failed to create discussion', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [newDiscussion, user.username, user.userId, fetchDiscussions]);

  const handleLogout = useCallback(async () => {
    await authManager.logout();
    navigate('/login');
  }, [navigate]);

  // Memoized filtered discussions with debounced search for performance
  const filteredDiscussions = useMemo(() => {
    return discussions.filter(disc => {
      const matchesSearch = disc.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           disc.content?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = selectedFilter === 'All' || disc.category === selectedFilter;
      return matchesSearch && matchesCategory;
    });
  }, [discussions, debouncedSearch, selectedFilter]);

  return (
    <motion.div {...fadeInUp}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ScrollProgress />
      
      <div className="dashboard-bg">
        <main className="dashboard-main">
          <section className="dashboard-welcome">
            <h1>Welcome, <span className="username-highlight">{user.username}</span></h1>
            <p className="tagline">{user.tagline}</p>
          </section>

          <section className="dashboard-info scroll-reveal">
            <div className="info-card">
              <h3>Your Profile</h3>
              <p><strong>ID:</strong> {user.userId}</p>
              <p><strong>Belief:</strong> {user.belief || 'Not specified'}</p>
            </div>
            <div className="info-card">
              <h3>Your Interests</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(user.categories || []).map((cat, index) => (
                  <li key={index} className="category-pill">{cat}</li>
                ))}
              </ul>
            </div>
            <div className="info-card scroll-reveal">
              <h3>Stats</h3>
              <p><strong>Discussions:</strong> <AnimatedCounter end={discussions.length} /></p>
              <p><strong>Active:</strong> Today</p>
            </div>
          </section>

          <section className="dashboard-discussion">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Latest Discussions</h2>
              <button className="create-discussion-btn" onClick={() => setShowCreateModal(true)}>
                ➕ Start Discussion
              </button>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-section">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search discussions"
              />
              <select 
                className="filter-select glow-on-hover"
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  fetchDiscussions(1, e.target.value);
                }}
                aria-label="Filter by category"
              >
                <option value="All">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {loading ? (
              <div className="discussion-list">
                {[1, 2, 3].map((n) => <SkeletonCard key={n} index={n} />)}
              </div>
            ) : filteredDiscussions.length === 0 ? (
              <div className="no-discussions">
                <p>{searchQuery || selectedFilter !== 'All' ? 'No discussions match your search.' : 'No discussions yet. Be the first to start one!'}</p>
              </div>
            ) : (
              <>
                <div className="discussion-list">
                  {filteredDiscussions.map((disc, index) => (
                    <DiscussionCard 
                      key={disc.id} 
                      disc={disc} 
                      index={index} 
                      onNavigate={navigate}
                      userId={user.userId}
                    />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-controls" style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '1rem', 
                    marginTop: '2rem',
                    alignItems: 'center'
                  }}>
                    <button 
                      className={pagination.page === 1 ? '' : 'ripple-button'}
                      onClick={() => fetchDiscussions(pagination.page - 1, selectedFilter)}
                      disabled={pagination.page === 1}
                      style={{
                        padding: '0.5rem 1rem',
                        background: pagination.page === 1 ? '#ccc' : 'var(--primary-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                      }}
                      aria-label="Previous page"
                    >
                      ← Previous
                    </button>
                    <span style={{ color: 'var(--text-color)' }}>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button 
                      className={pagination.page === pagination.totalPages ? '' : 'ripple-button'}
                      onClick={() => fetchDiscussions(pagination.page + 1, selectedFilter)}
                      disabled={pagination.page === pagination.totalPages}
                      style={{
                        padding: '0.5rem 1rem',
                        background: pagination.page === pagination.totalPages ? '#ccc' : 'var(--primary-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
                      }}
                      aria-label="Next page"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        {/* Create Discussion Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🏛️ Start a New Discussion</h2>
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>
              
              <form onSubmit={handleCreateDiscussion}>
                <div className="form-group">
                  <label>Discussion Title</label>
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    required
                    minLength={5}
                    maxLength={200}
                    aria-label="Discussion title"
                    aria-required="true"
                  />
                  <small className="char-count" aria-live="polite">
                    {newDiscussion.title.length}/200 characters
                  </small>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newDiscussion.category}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    rows={6}
                    required
                    minLength={10}
                    maxLength={5000}
                    aria-label="Discussion content"
                    aria-required="true"
                  />
                  <small className="char-count" aria-live="polite">
                    {newDiscussion.content.length}/5000 characters
                  </small>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Create Discussion
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Dashboard;