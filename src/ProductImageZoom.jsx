import React, { useState } from 'react';
import './ProductZoom.css';

const ProductImageZoom = ({ src }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Exact percentage calculation
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <div 
      className="magnifier-container inner-zoom" 
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Original Image */}
      <img src={src} className="main-product-img" alt="Product" />

      {/* Zoom Overlay (Ab ye image ke upar hi dikhega) */}
      {showMagnifier && (
        <div
          className="magnifier-window-inner"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
          }}
        />
      )}
    </div>
  );
};

export default ProductImageZoom;