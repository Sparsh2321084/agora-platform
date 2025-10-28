import React from 'react';
import './MythIcon.css';

/**
 * MythIcon - Mythological Deity and Symbol Icons
 * Each god/symbol represents different features and virtues
 * Based on Greek pantheon and philosophical concepts
 */

const MYTH_ICONS = {
  athena: { icon: '🦉', name: 'Athena', virtue: 'Wisdom', color: 'var(--olive-green)' },
  apollo: { icon: '☀️', name: 'Apollo', virtue: 'Truth & Arts', color: 'var(--olympic-gold)' },
  hermes: { icon: '⚡', name: 'Hermes', virtue: 'Communication', color: 'var(--azurite)' },
  dionysus: { icon: '🍇', name: 'Dionysus', virtue: 'Creativity', color: 'var(--tyrian-purple)' },
  artemis: { icon: '🏹', name: 'Artemis', virtue: 'Focus', color: 'var(--silver-leaf)' },
  hephaestus: { icon: '🔥', name: 'Hephaestus', virtue: 'Craft', color: 'var(--cinnabar-red)' },
  poseidon: { icon: '🔱', name: 'Poseidon', virtue: 'Power', color: 'var(--aegean-blue)' },
  demeter: { icon: '🌾', name: 'Demeter', virtue: 'Growth', color: 'var(--ochre-yellow)' },
  
  // Philosophical Symbols
  laurel: { icon: '🌿', name: 'Laurel', virtue: 'Victory', color: 'var(--laurel-green)' },
  lyre: { icon: '🎵', name: 'Lyre', virtue: 'Harmony', color: 'var(--olympic-gold)' },
  scroll: { icon: '📜', name: 'Scroll', virtue: 'Knowledge', color: 'var(--ochre-yellow)' },
  torch: { icon: '🔦', name: 'Torch', virtue: 'Enlightenment', color: 'var(--saffron)' },
  olive: { icon: '🫒', name: 'Olive', virtue: 'Peace', color: 'var(--olive-green)' },
  column: { icon: '🏛️', name: 'Column', virtue: 'Structure', color: 'var(--pentelic-marble)' },
  theater: { icon: '🎭', name: 'Theater', virtue: 'Drama', color: 'var(--tyrian-purple)' },
  wreath: { icon: '👑', name: 'Wreath', virtue: 'Honor', color: 'var(--olympic-gold)' },
};

const MythIcon = ({ 
  type = 'athena', 
  size = 'medium', // 'small', 'medium', 'large', 'xlarge'
  showLabel = false,
  showVirtue = false,
  animated = true,
  onClick
}) => {
  const myth = MYTH_ICONS[type] || MYTH_ICONS.athena;
  
  const sizeClasses = {
    small: 'myth-icon-small',
    medium: 'myth-icon-medium',
    large: 'myth-icon-large',
    xlarge: 'myth-icon-xlarge'
  };

  return (
    <div 
      className={`myth-icon-wrapper ${sizeClasses[size]} ${animated ? 'myth-animated' : ''} ${onClick ? 'myth-clickable' : ''}`}
      onClick={onClick}
      title={showLabel || showVirtue ? undefined : `${myth.name} - ${myth.virtue}`}
    >
      <div 
        className="myth-icon-circle"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${myth.color}, ${myth.color}dd)`,
          boxShadow: `0 4px 12px ${myth.color}66, inset 0 2px 4px rgba(255, 255, 255, 0.3)`
        }}
      >
        <span className="myth-symbol">{myth.icon}</span>
      </div>
      
      {(showLabel || showVirtue) && (
        <div className="myth-labels">
          {showLabel && <div className="myth-name">{myth.name}</div>}
          {showVirtue && <div className="myth-virtue">{myth.virtue}</div>}
        </div>
      )}
    </div>
  );
};

// Export myths list for reference
export { MYTH_ICONS };
export default MythIcon;
