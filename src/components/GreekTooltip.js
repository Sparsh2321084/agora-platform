import React, { useState } from 'react';
import './GreekTooltip.css';

const GreekTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="greek-tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`greek-tooltip ${position}`}>
          <div className="tooltip-plaque">
            <div className="tooltip-text">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreekTooltip;
