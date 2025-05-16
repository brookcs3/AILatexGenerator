import React from 'react';
import './DistortionBackground.css';

// A simpler version of the background effect using pure CSS
const DistortionBackground = () => {
  return (
    <div className="distortion-background-container">
      {/* Animated background with particles and gradients */}
      <div className="animated-bg">
        <div className="gradient-layer"></div>
        <div className="noise-layer"></div>
        <div className="particles-container">
          {[...Array(40)].map((_, index) => (
            <div key={index} className="particle" style={{
              '--size': `${Math.random() * 3 + 1}px`,
              '--left': `${Math.random() * 100}%`,
              '--top': `${Math.random() * 100}%`,
              '--duration': `${Math.random() * 20 + 15}s`,
              '--delay': `${Math.random() * 5}s`,
              '--hue': `${Math.random() * 60 + 230}deg`,
              '--opacity': `${Math.random() * 0.5 + 0.2}`
            }}></div>
          ))}
        </div>
      </div>
      
      {/* Controls UI */}
      <div className="distortion-controls">
        <div className="controls-panel">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 tracking-wide uppercase">Distortion Controls</h3>
          
          <div className="mb-4">
            <label htmlFor="dither-pattern" className="block text-sm font-medium text-gray-300 mb-2">Dither Pattern</label>
            <select id="dither-pattern" className="w-full bg-gray-800/80 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 placeholder-gray-400 shadow-sm appearance-none">
              <option value="0">Bayer Matrix (8x8)</option>
              <option value="1">Halftone Dots</option>
              <option value="2">Line Pattern</option>
              <option value="3">Noise Dithering</option>
              <option value="4">No Dithering</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="dither-scale" className="block text-sm font-medium text-gray-300 mb-2">Dither Scale</label>
            <select id="dither-scale" className="w-full bg-gray-800/80 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 placeholder-gray-400 shadow-sm appearance-none">
              <option value="1.0">Fine</option>
              <option value="1.5" selected>Medium</option>
              <option value="2.5">Coarse</option>
              <option value="3.5">Very Coarse</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistortionBackground;