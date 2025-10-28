import React, { useEffect, useState } from 'react';
import './PageTransition.css';

const PageTransition = ({ children, trigger }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    if (trigger) {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        setIsEntering(true);
      }, 600);
    }
  }, [trigger]);

  useEffect(() => {
    if (isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isEntering]);

  return (
    <>
      {isExiting && <div className="page-curtain exit" />}
      {isEntering && <div className="page-curtain enter" />}
      <div className={`page-content ${isExiting ? 'fade-out' : ''} ${isEntering ? 'fade-in' : ''}`}>
        {children}
      </div>
    </>
  );
};

export default PageTransition;
