import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ text, trigger = false }) => {
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Array of typography classes to rotate through
  const fontClasses = [
    'typography--h1',           // Poppins font
    'typography--dirtyline-display', // Dirtyline font
    'typography--tropikal-display'   // Final Tropikal font
  ];

  useEffect(() => {
    if (!trigger) return;
    
    // Start animation when trigger becomes true
    setIsAnimating(true);
  }, [trigger]);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCurrentFontIndex((prevIndex) => {
        if (prevIndex < fontClasses.length - 1) {
          return prevIndex + 1;
        } else {
          // Stop at the final font
          setIsAnimating(false);
          return prevIndex;
        }
      });
    }, 800); // Change font every 800ms

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <h1 className={`header ${fontClasses[currentFontIndex]}`}>
      {text}
    </h1>
  );
};

export default Header;
