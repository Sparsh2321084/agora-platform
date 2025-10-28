import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GreekFrieze.css';

/**
 * GreekFrieze - Panathenaic Procession Style Header
 * Represents the continuous narrative relief of the Parthenon
 * Users, achievements, and philosophical milestones flow like ancient frieze figures
 * NOW CLICKABLE: Each figure links to its concept page
 */

const GreekFrieze = ({ items = [], title, subtitle }) => {
  const navigate = useNavigate();
  
  // Map labels to routes
  const getLinkForLabel = (label) => {
    const routes = {
      'Foundation': '/foundation',
      'Wisdom': '/wisdom',
      'Ideas': '/ideas',
      'Dialogue': '/dialogue',
      'Knowledge': '/knowledge',
      'Growth': '/growth',
      'Justice': '/justice',
      'Truth': '/truth',
      'Excellence': '/excellence'
    };
    return routes[label] || null;
  };
  
  const handleFigureClick = (label) => {
    const route = getLinkForLabel(label);
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="greek-frieze">
      <div className="frieze-header">
        {title && <h2 className="frieze-title text-epigraphic">{title}</h2>}
        {subtitle && <p className="frieze-subtitle">{subtitle}</p>}
      </div>
      
      <div className="frieze-scroll-container">
        <div className="frieze-figures">
          {items.map((item, index) => {
            const route = getLinkForLabel(item.label);
            const isClickable = !!route;
            
            return (
              <div 
                key={index} 
                className={`frieze-figure ${isClickable ? 'clickable' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => isClickable && handleFigureClick(item.label)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyPress={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    handleFigureClick(item.label);
                  }
                }}
                aria-label={isClickable ? `Explore ${item.label}` : item.label}
              >
                {item.icon && (
                  <div className="figure-icon">{item.icon}</div>
                )}
                {item.image && (
                  <img src={item.image} alt={item.label} className="figure-image" />
                )}
                <span className="figure-label">{item.label}</span>
                {isClickable && <span className="figure-hint">Click to explore</span>}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="frieze-meander-border"></div>
    </div>
  );
};

export default GreekFrieze;
