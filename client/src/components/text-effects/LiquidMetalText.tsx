import React, { useEffect, useRef } from 'react';

interface LiquidMetalTextProps {
  text: string;
  className?: string;
}

const LiquidMetalText: React.FC<LiquidMetalTextProps> = ({ 
  text = "AI LATEX GENERATOR",
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.offsetWidth;
      canvas.height = 40; // Fixed height for title
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particles for liquid effect
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];
    const particleCount = 100;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        color: `hsla(${210 + Math.random() * 40}, 100%, 60%, 0.8)`
      });
    }
    
    // Animation function
    let animationId: number;
    let frame = 0;
    
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background with slight gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (const particle of particles) {
        // Update position with slight wobble
        particle.x += particle.vx + Math.sin(frame * 0.05 + particle.x * 0.01) * 0.2;
        particle.y += particle.vy + Math.cos(frame * 0.05 + particle.y * 0.01) * 0.2;
        
        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      }
      
      // Draw text
      const fontSize = Math.min(canvas.width / 20, 18);
      ctx.font = `bold ${fontSize}px 'Raleway', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Create gradient for text
      const textGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      textGradient.addColorStop(0, '#3b82f6');
      textGradient.addColorStop(0.5, '#8b5cf6');
      textGradient.addColorStop(1, '#3b82f6');
      
      // Apply gradient
      ctx.fillStyle = textGradient;
      
      // Draw text with wave effect
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const x = i * fontSize * 0.6 + 5;
        
        // Calculate wave offset
        const waveHeight = 3;
        const frequency = 0.05;
        const offset = Math.sin(frame * 0.05 + i * frequency) * waveHeight;
        
        // Draw individual character
        ctx.fillText(char, x, canvas.height / 2 + offset);
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [text]);
  
  return (
    <div className={`liquid-metal-container ${className}`} style={{ position: 'relative', width: '200px', height: '30px' }}>
      <canvas 
        ref={canvasRef} 
        className="liquid-metal-canvas"
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default LiquidMetalText;