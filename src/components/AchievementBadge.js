import React from 'react';
import './AchievementBadge.css';

const AchievementBadge = ({ type = 'bronze', count, label, tooltip }) => {
  const getBadgeConfig = () => {
    if (count >= 100) {
      return {
        level: 'gold',
        icon: '🏆',
        color: 'linear-gradient(135deg, #d4af37, #f4d03f)',
        wreath: '🌟',
        title: 'Legendary Philosopher'
      };
    } else if (count >= 50) {
      return {
        level: 'silver',
        icon: '🥈',
        color: 'linear-gradient(135deg, #c0c0c0, #e8e8e8)',
        wreath: '⭐',
        title: 'Distinguished Orator'
      };
    } else if (count >= 10) {
      return {
        level: 'bronze',
        icon: '🥉',
        color: 'linear-gradient(135deg, #cd7f32, #e89552)',
        wreath: '🌿',
        title: 'Aspiring Scholar'
      };
    } else {
      return {
        level: 'novice',
        icon: '📜',
        color: 'linear-gradient(135deg, #8a8a7a, #a5a59a)',
        wreath: '🍃',
        title: 'New Citizen'
      };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className={`achievement-badge ${badge.level}`} title={tooltip || badge.title}>
      <div className="badge-wreath">{badge.wreath}</div>
      <div className="badge-icon" style={{ background: badge.color }}>
        <span className="badge-symbol">{badge.icon}</span>
        <span className="badge-count">{count}</span>
      </div>
      <div className="badge-label">{label}</div>
      {tooltip && (
        <div className="badge-tooltip">
          <div className="tooltip-content">{tooltip}</div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
