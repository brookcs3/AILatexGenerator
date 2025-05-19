import React, { useEffect, useRef } from 'react';
import './DistortionBackground.css';

const DistortionBackground = () => {
  const backgroundRef = useRef(null);
  const particlesRef = useRef(null);
  
  // Interactive network effect with canvas
  useEffect(() => {
    if (!particlesRef.current) return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'particles-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    
    particlesRef.current.innerHTML = '';
    particlesRef.current.appendChild(canvas);
    
    // Get context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resize = () => {
      canvas.width = particlesRef.current?.clientWidth || window.innerWidth;
      canvas.height = particlesRef.current?.clientHeight || window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Particle settings
    const particleCount = 100; // Increased from 80 to 100 for better distribution
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    
    // Create particles with improved initial distribution
    const particles = [];
    
    // Helper function to ensure particles are well-distributed
    const getRandomPosition = () => {
      // Divide canvas into grid cells for better distribution
      const gridCols = 10;
      const gridRows = 10;
      const cellWidth = canvas.width / gridCols;
      const cellHeight = canvas.height / gridRows;
      
      // Pick a random cell
      const cellX = Math.floor(Math.random() * gridCols);
      const cellY = Math.floor(Math.random() * gridRows);
      
      // Return a position within that cell (add slight padding)
      return {
        x: (cellX + 0.2 + Math.random() * 0.6) * cellWidth,
        y: (cellY + 0.2 + Math.random() * 0.6) * cellHeight
      };
    };
    
    for (let i = 0; i < particleCount; i++) {
      const position = getRandomPosition();
      particles.push({
        x: position.x,
        y: position.y,
        radius: Math.random() * 2.5 + 1, // Slightly smaller max radius
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() * 1.5 - 0.75) * 0.5, // More varied velocities
        vy: (Math.random() * 1.5 - 0.75) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        // Add slight repulsion factor to avoid clumping
        repulsion: Math.random() * 0.5 + 0.5
      });
    }
    
    // Mouse move handler
    const handleMouseMove = (e) => {
      // Get correct mouse coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    // Touch move handler for mobile
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        mouseY = e.touches[0].clientY - rect.top;
        e.preventDefault(); // Prevent scrolling while interacting
      }
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    // Animation function
    const animate = () => {
      // Request next frame
      const animationId = requestAnimationFrame(animate);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles and connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Move particles
        p.x += p.vx;
        p.y += p.vy;
        
        // Reverse direction if hit edge
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        // Slight attraction to mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          p.x += dx * 0.01;
          p.y += dy * 0.01;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        
        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            // Draw line with gradient opacity based on distance
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const opacity = 0.3 * (1 - distance / 100);
            ctx.strokeStyle = '#a855f7';
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
        
        // Draw connections to mouse when close
        const mouseDistance = Math.sqrt(
          (p.x - mouseX) * (p.x - mouseX) + 
          (p.y - mouseY) * (p.y - mouseY)
        );
        
        if (mouseDistance < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          const opacity = 0.3 * (1 - mouseDistance / 150);
          ctx.strokeStyle = '#ec4899';
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    };
    
    // Start animation
    const animationId = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (particlesRef.current) {
        particlesRef.current.innerHTML = '';
      }
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
