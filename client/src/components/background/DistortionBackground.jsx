import React, { useEffect, useRef } from 'react';
import './DistortionBackground.css';

const DistortionBackground = () => {
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  
  useEffect(() => {
    let backgroundControls = null;
    
    // Dynamically import Three.js distortion background
    const loadBackground = async () => {
      try {
        // Import the module dynamically
        const module = await import('/js/distortion-background.js');
        if (containerRef.current) {
          // Initialize the background
          backgroundControls = module.initDistortionBackground(containerRef.current);
          
          // Set up UI controls
          if (controlsRef.current) {
            const patternSelect = controlsRef.current.querySelector('#dither-pattern');
            const scaleSelect = controlsRef.current.querySelector('#dither-scale');
            
            patternSelect.addEventListener('change', (e) => {
              backgroundControls.setDitherPattern(e.target.value);
            });
            
            scaleSelect.addEventListener('change', (e) => {
              backgroundControls.setDitherScale(e.target.value);
            });
          }
        }
      } catch (err) {
        console.error('Failed to load distortion background:', err);
      }
    };
    
    loadBackground();
    
    // Cleanup function
    return () => {
      // Remove event listeners if needed
      if (controlsRef.current) {
        const patternSelect = controlsRef.current.querySelector('#dither-pattern');
        const scaleSelect = controlsRef.current.querySelector('#dither-scale');
        
        if (patternSelect) {
          patternSelect.removeEventListener('change', () => {});
        }
        
        if (scaleSelect) {
          scaleSelect.removeEventListener('change', () => {});
        }
      }
    };
  }, []);
  
  return (
    <div className="distortion-background-container">
      {/* Container for Three.js canvas */}
      <div ref={containerRef} className="canvas-container"></div>
      
      {/* Controls UI */}
      <div ref={controlsRef} className="distortion-controls">
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