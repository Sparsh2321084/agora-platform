import React from 'react';
import './TempleColumn.css';

/**
 * TempleColumn - Architectural Order Components
 * Doric (Strength), Ionic (Intellect), Corinthian (Opulence)
 * Used to structure dashboard sections and feature panels
 */

const TempleColumn = ({ 
  order = 'doric', // 'doric', 'ionic', 'corinthian'
  children,
  title,
  icon,
  clickable = false,
  onClick
}) => {
  const orderClasses = {
    doric: 'column-doric',
    ionic: 'column-ionic',
    corinthian: 'column-corinthian'
  };

  const orderIcons = {
    doric: '🏛️',
    ionic: '📜',
    corinthian: '🌿'
  };

  return (
    <div 
      className={`temple-column ${orderClasses[order]} ${clickable ? 'clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="column-capital">
        <span className="capital-icon">{icon || orderIcons[order]}</span>
      </div>
      
      {title && (
        <div className="column-architrave">
          <h3 className="architrave-text text-epigraphic">{title}</h3>
        </div>
      )}
      
      <div className="column-shaft">
        <div className="shaft-content">
          {children}
        </div>
      </div>
      
      <div className="column-base"></div>
    </div>
  );
};

export default TempleColumn;
