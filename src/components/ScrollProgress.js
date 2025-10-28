// ═══════════════════════════════════════════════════════════════════
// SCROLL PROGRESS INDICATOR
// Shows reading progress at top of page - "Path of Enlightenment"
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { useScrollProgress } from '../animations/ScrollReveal';
import '../styles/MicroAnimations.css';

const ScrollProgress = () => {
  const progress = useScrollProgress();

  return (
    <div className="scroll-progress">
      <div 
        className="scroll-progress-bar" 
        style={{ width: `${progress}%` }}
        title={`Path of Enlightenment: ${Math.round(progress)}%`}
      />
    </div>
  );
};

export default ScrollProgress;
