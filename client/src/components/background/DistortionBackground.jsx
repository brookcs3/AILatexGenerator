import React, { useEffect, useRef } from 'react';
import 'particles.js';
import './DistortionBackground.css';

const DistortionBackground = () => {
  const backgroundRef = useRef(null);
  const particlesRef = useRef(null);
  
  // Initialize particles.js when component mounts
  useEffect(() => {
    const initParticles = () => {
      try {
        // Initialize particles with our config
        if (window.particlesJS && particlesRef.current) {
          // Use the particlesRef.current ID for initialization
          const particlesId = 'particles-js-' + Math.random().toString(36).substring(2, 10);
          particlesRef.current.id = particlesId;
          
          // Initialize particles
          window.particlesJS.load(
            particlesId, 
            '/js/particles-config.json',
            function() {
              console.log('Particles.js loaded and initialized successfully!');
            }
          );
        }
      } catch (err) {
        console.error('Failed to initialize particles:', err);
        
        // Fallback to CSS particles if particles.js fails
        createCSSParticles();
      }
    };
    
    // Fallback method using CSS particles (same as before)
    const createCSSParticles = () => {
      if (particlesRef.current) {
        const particlesContainer = particlesRef.current;
        particlesContainer.innerHTML = '';
        
        // Create particles with professional colors
        const particleCount = 60;
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
        
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'bg-particle';
          
          // Random position
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          
          // Random size
          const size = Math.random() * 3 + 1;
          
          // Random color from our palette
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          // Set particle styles
          particle.style.position = 'absolute';
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.borderRadius = '50%';
          particle.style.backgroundColor = color;
          particle.style.boxShadow = `0 0 ${size}px ${color}`;
          particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
          
          // Add smooth animation
          const duration = Math.random() * 20 + 15;
          const delay = Math.random() * 5;
          
          // Create unique animation name
          const animName = `float-${i}`;
          
          // Create and append style with keyframes
          const style = document.createElement('style');
          style.innerHTML = `
            @keyframes ${animName} {
              0% {
                transform: translate(0, 0);
              }
              25% {
                transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px);
              }
              50% {
                transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px);
              }
              75% {
                transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px);
              }
              100% {
                transform: translate(0, 0);
              }
            }
          `;
          document.head.appendChild(style);
          
          // Apply animation
          particle.style.animation = `${animName} ${duration}s ease-in-out ${delay}s infinite`;
          
          // Add to container
          particlesContainer.appendChild(particle);
        }
      }
    };
    
    // Initialize particles
    initParticles();
    
    // Cleanup function
    return () => {
      // Cleanup any created particles (for CSS fallback)
      if (particlesRef.current) {
        particlesRef.current.innerHTML = '';
      }
      
      // Remove any dynamically added styles
      document.querySelectorAll('style[data-particle-style]').forEach(style => {
        style.remove();
      });
    };
  }, []);
  
  return (
    <div className="distortion-background-container" ref={backgroundRef}>
      {/* Gradient backdrop */}
      <div className="gradient-backdrop"></div>
      
      {/* Particles effect */}
      <div className="particles-backdrop" ref={particlesRef}></div>
      
      {/* TV Scan lines effect */}
      <div className="scanlines-effect">
        <div className="scanline-overlay"></div>
      </div>
      
      {/* TV Static noise */}
      <div className="tv-static-effect"></div>
      
      {/* TV Glitch effect */}
      <div className="tv-glitch-effect"></div>
      
      {/* CRT Vignette effect */}
      <div className="crt-vignette"></div>
      
      {/* Dithering pattern */}
      <div className="dither-pattern"></div>
      
      {/* Controls UI - completely hidden */}
      <div className="distortion-controls hidden">
        {/* Controls completely hidden with the 'hidden' class */}
      </div>
    </div>
  );
};

export default DistortionBackground;
