import React, { useState } from 'react';
import './ProductZoom.css';

const ProductImageZoom = ({ src }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  // Common function for calculation
  const updatePosition = (clientX, clientY, currentTarget) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    // Percentage calculation (Clamping between 0-100 for safety)
    const x = Math.max(0, Math.min(100, ((clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - top) / height) * 100));
    
    setPosition({ x, y });
  };

  // Mouse handle (Desktop)
  const handleMouseMove = (e) => {
    updatePosition(e.clientX, e.clientY, e.currentTarget);
  };

  // Touch handle (Mobile)
  const handleTouchMove = (e) => {
    // Zoom ke waqt page scroll na ho isliye (Optional but recommended)
    // e.preventDefault(); 
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY, e.currentTarget);
  };

  return (
    <div 
      className="magnifier-container inner-zoom" 
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
      // Touch events for Mobile
      onTouchStart={() => setShowMagnifier(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setShowMagnifier(false)}
      style={{ touchAction: 'none' }} // Prevent scrolling while touching image
    >
      {/* Original Image */}
      <img src={src} className="main-product-img" alt="Product" />

      {/* Zoom Overlay */}
      {showMagnifier && (
        <div
          className="magnifier-window-inner"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: '250%', // Zoom level
          }}
        />
      )}
    </div>
  );
};

export default ProductImageZoom;