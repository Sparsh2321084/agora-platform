import React, { useState, useEffect } from 'react';
import './OmphalosCenter.css';

/**
 * OmphalosCenter - Sacred Navel Stone of Delphi
 * Represents the center of wisdom, the oracle's voice
 * Used for login/onboarding and central wisdom features
 */

const OmphalosCenter = ({ 
  message = "Know Thyself", 
  subtitle = "γνῶθι σεαυτόν",
  onActivate,
  children,
  isActive = false 
}) => {
  const [pulsing, setPulsing] = useState(false);
  const [maxims] = useState([
    { greek: "γνῶθι σεαυτόν", english: "Know Thyself" },
    { greek: "μηδὲν ἄγαν", english: "Nothing in Excess" },
    { greek: "ἐγγύα πάρα δ'ἄτα", english: "Make a Pledge and Mischief is Nigh" },
  ]);
  const [currentMaxim, setCurrentMaxim] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMaxim((prev) => (prev + 1) % maxims.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [maxims.length]);

  const handleClick = () => {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 1000);
    if (onActivate) onActivate();
  };

  return (
    <div className={`omphalos-wrapper ${isActive ? 'omphalos-active' : ''}`}>
      <div 
        className={`omphalos-stone ${pulsing ? 'omphalos-pulsing' : ''}`}
        onClick={handleClick}
      >
        <div className="omphalos-inner">
          <div className="omphalos-center-dot"></div>
          
          <div className="omphalos-bands">
            <div className="band band-1"></div>
            <div className="band band-2"></div>
            <div className="band band-3"></div>
          </div>
          
          {children || (
            <div className="omphalos-content">
              <h3 className="omphalos-message">{message}</h3>
              <p className="omphalos-subtitle">{subtitle}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="delphic-maxims">
        <div className="maxim-container">
          <p className="maxim-greek" key={`greek-${currentMaxim}`}>
            {maxims[currentMaxim].greek}
          </p>
          <p className="maxim-english" key={`english-${currentMaxim}`}>
            {maxims[currentMaxim].english}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OmphalosCenter;
