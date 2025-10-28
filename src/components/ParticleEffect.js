import React, { useEffect, useRef } from 'react';
import './ParticleEffect.css';

const ParticleEffect = ({ type = 'laurel', trigger = false, count = 15 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = `particle particle-${type}`;
      
      // Random starting position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 0.5}s`;
      particle.style.animationDuration = `${2 + Math.random() * 2}s`;
      
      // Different icons based on type
      if (type === 'laurel') {
        particle.innerHTML = ['🌿', '🍃', '🌟'][Math.floor(Math.random() * 3)];
      } else if (type === 'dust') {
        particle.innerHTML = '✨';
      } else if (type === 'star') {
        particle.innerHTML = '⭐';
      }
      
      containerRef.current.appendChild(particle);
      particles.push(particle);
      
      // Remove after animation
      setTimeout(() => {
        particle.remove();
      }, 4000);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, [trigger, type, count]);

  return <div ref={containerRef} className="particle-container" />;
};

export default ParticleEffect;
