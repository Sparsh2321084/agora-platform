import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDebounce } from './hooks/useDebounce';
import config from './config';
import './Search.css';

/**
 * SEARCH/EXPLORE PAGE - Find Discussions
 * Performance: Debounced search input, virtual scrolling for results
 */

const Search = memo(() => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('agoraUser') || 'null');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // AI search removed - unused variables cleaned up

  // Debounce search query for performance
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchDiscussions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // AI search removed - use only basic keyword search
        const params = new URLSearchParams({
          q: debouncedQuery,
          category: category,
          page: 1,
          limit: 20
        });

        const response = await fetch(`${config.API_URL}/search?${params}`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.discussions || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search discussions. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchDiscussions();
  }, [debouncedQuery, category, user?.id]);

  const categories = [
    { value: 'all', label: 'All Topics', icon: '🌍' },
    { value: 'metaphysics', label: 'Metaphysics', icon: '🌌' },
    { value: 'ethics', label: 'Ethics', icon: '⚖️' },
    { value: 'epistemology', label: 'Epistemology', icon: '🧠' },
    { value: 'aesthetics', label: 'Aesthetics', icon: '🎨' },
    { value: 'logic', label: 'Logic', icon: '🔬' },
    { value: 'stoicism', label: 'Stoicism', icon: '🏛️' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="search-page"
    >
      {/* Navigation */}
      {/* Search Content */}
      <div className="search-container container-golden">
        <div className="search-header">
          <h1 className="search-title text-epigraphic">
            🔍 Explore Discussions
            <span className="title-greek">Ἀναζήτηση</span>
          </h1>
          <p className="search-subtitle">
            Search the marketplace of ideas for wisdom
          </p>
        </div>

        {/* Search Input */}
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* AI features removed - metadata display disabled */}

        {/* Category Filters */}
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-btn ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              <span className="category-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="search-results">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Searching the agora...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : searchQuery && results.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No discussions found for "{searchQuery}"</p>
              <p className="empty-hint">Try different keywords or browse by category</p>
            </div>
          ) : !searchQuery ? (
            <div className="empty-state">
              <span className="empty-icon">🏛️</span>
              <p>Enter a search query to explore discussions</p>
              <p className="empty-hint">Or browse categories above</p>
            </div>
          ) : (
            <>
              <div className="results-count">
                Found {results.length} discussion{results.length !== 1 ? 's' : ''}
              </div>
              <div className="results-list">
                {results.map((result, idx) => (
                  <motion.div
                    key={result.id}
                    className="result-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => navigate(`/discussion/${result.id}`)}
                  >
                    <div className="result-header">
                      <h3 className="result-title">{result.title}</h3>
                      <span className="result-category">{result.category || 'General'}</span>
                    </div>
                    <p className="result-excerpt">
                      {result.content.length > 200 
                        ? result.content.substring(0, 200) + '...' 
                        : result.content}
                    </p>
                    <div className="result-footer">
                      <span className="result-author">👤 {result.username}</span>
                      <span className="result-replies">💬 {result.replies || 0} replies</span>
                      <span className="result-views">👁️ {result.views || 0} views</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
});

Search.displayName = 'Search';

export default Search;
