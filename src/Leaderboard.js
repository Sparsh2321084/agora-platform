import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import './Leaderboard.css';

/**
 * LEADERBOARD PAGE - Top Users by Reputation
 * Shows rankings, badges, and reputation points
 */

const Leaderboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('agoraUser') || 'null');

  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserRank();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_URL}/api/leaderboard?limit=100`);
      
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/reputation/${user.id}/rank`);
      if (response.ok) {
        const data = await response.json();
        setUserRank(data);
      }
    } catch (err) {
      console.error('Error fetching user rank:', err);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Novice': '#8b949e',
      'Apprentice': '#cd7f32',
      'Scholar': '#c0c0c0',
      'Master': '#d4af37',
      'Sage': '#b9f2ff',
      'Oracle': '#ff69b4'
    };
    return colors[level] || '#8b949e';
  };

  const getLevelIcon = (level) => {
    const icons = {
      'Novice': '🌱',
      'Apprentice': '📚',
      'Scholar': '🎓',
      'Master': '🧙',
      'Sage': '🧙‍♂️',
      'Oracle': '🔮'
    };
    return icons[level] || '🌱';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="leaderboard-page"
    >
      <div className="leaderboard-container">
        {/* Header */}
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">
            🏆 Leaderboard
            <span className="title-greek">Ἀγών</span>
          </h1>
          <p className="leaderboard-subtitle">
            The most distinguished philosophers of the Agora
          </p>
        </div>

        {/* User's Own Rank Card */}
        {userRank && (
          <motion.div
            className="user-rank-card"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="rank-badge">#{userRank.rank || '—'}</div>
            <div className="rank-info">
              <h3>{user.username}</h3>
              <div className="rank-stats">
                <span className="stat">
                  ⭐ {userRank.points} points
                </span>
                <span className="stat">
                  📊 Top {userRank.percentile}%
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading rankings...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏛️</span>
            <h3>No Rankings Yet</h3>
            <p>Be the first to earn reputation by creating discussions!</p>
            <button 
              className="cta-button"
              onClick={() => navigate('/dashboard')}
            >
              Create Discussion
            </button>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="podium">
                {/* 2nd Place */}
                <motion.div
                  className="podium-position second"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="position-medal">🥈</div>
                  <div className="position-avatar">
                    {leaderboard[1].top_badges || '👤'}
                  </div>
                  <h3 className="position-name">{leaderboard[1].username}</h3>
                  <div 
                    className="position-level"
                    style={{ color: getLevelColor(leaderboard[1].level) }}
                  >
                    {getLevelIcon(leaderboard[1].level)} {leaderboard[1].level}
                  </div>
                  <div className="position-points">
                    ⭐ {leaderboard[1].points.toLocaleString()} pts
                  </div>
                  <div className="position-badges">
                    {leaderboard[1].badge_count} badges
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  className="podium-position first"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="position-medal">🥇</div>
                  <div className="crown">👑</div>
                  <div className="position-avatar">
                    {leaderboard[0].top_badges || '👤'}
                  </div>
                  <h3 className="position-name">{leaderboard[0].username}</h3>
                  <div 
                    className="position-level"
                    style={{ color: getLevelColor(leaderboard[0].level) }}
                  >
                    {getLevelIcon(leaderboard[0].level)} {leaderboard[0].level}
                  </div>
                  <div className="position-points">
                    ⭐ {leaderboard[0].points.toLocaleString()} pts
                  </div>
                  <div className="position-badges">
                    {leaderboard[0].badge_count} badges
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  className="podium-position third"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="position-medal">🥉</div>
                  <div className="position-avatar">
                    {leaderboard[2].top_badges || '👤'}
                  </div>
                  <h3 className="position-name">{leaderboard[2].username}</h3>
                  <div 
                    className="position-level"
                    style={{ color: getLevelColor(leaderboard[2].level) }}
                  >
                    {getLevelIcon(leaderboard[2].level)} {leaderboard[2].level}
                  </div>
                  <div className="position-points">
                    ⭐ {leaderboard[2].points.toLocaleString()} pts
                  </div>
                  <div className="position-badges">
                    {leaderboard[2].badge_count} badges
                  </div>
                </motion.div>
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="rankings-table">
              <h2 className="section-title">Full Rankings</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="rank-col">Rank</th>
                      <th className="user-col">Philosopher</th>
                      <th className="level-col">Level</th>
                      <th className="points-col">Points</th>
                      <th className="badges-col">Badges</th>
                      <th className="stats-col">Stats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <motion.tr
                        key={entry.user_id}
                        className={entry.user_id === user?.id ? 'current-user' : ''}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/profile/${entry.user_id}`)}
                      >
                        <td className="rank-col">
                          <span className="rank-number">
                            {entry.leaderboard_rank}
                          </span>
                        </td>
                        <td className="user-col">
                          <div className="user-info">
                            <span className="user-avatar">
                              {entry.top_badges || '👤'}
                            </span>
                            <span className="username">{entry.username}</span>
                          </div>
                        </td>
                        <td className="level-col">
                          <span 
                            className="level-badge"
                            style={{ 
                              backgroundColor: getLevelColor(entry.level) + '20',
                              color: getLevelColor(entry.level)
                            }}
                          >
                            {getLevelIcon(entry.level)} {entry.level}
                          </span>
                        </td>
                        <td className="points-col">
                          <span className="points">
                            ⭐ {entry.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="badges-col">
                          <span className="badge-count">
                            🏆 {entry.badge_count}
                          </span>
                        </td>
                        <td className="stats-col">
                          <div className="user-stats">
                            <span>📝 {entry.posts_count}</span>
                            <span>👍 {entry.upvotes_received}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Leaderboard;
