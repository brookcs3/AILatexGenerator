import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './HyperIntro.css';

// Modern intro component with professional animation effects

interface HyperIntroProps {
  onComplete?: () => void;
}

const HyperIntro: React.FC<HyperIntroProps> = ({ onComplete }) => {
  // References for DOM elements
  const introContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const gradientBackgroundRef = useRef<HTMLDivElement>(null);
  const waveAnimationRef = useRef<HTMLDivElement>(null);
  
  // Create gradient background and wave animation
  useEffect(() => {
    try {
      // Create beautiful gradient background animation
      if (gradientBackgroundRef.current) {
        const background = gradientBackgroundRef.current;
        
        // Animate the gradient background
        gsap.to(background, {
          background: 'linear-gradient(135deg, #1a0b2e 0%, #2a1052 50%, #1a0b2e 100%)',
          duration: 10,
          repeat: -1, 
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
      
      // Create particles for background effect
      if (particlesRef.current) {
        const particlesContainer = particlesRef.current;
        particlesContainer.innerHTML = '';
        particlesContainer.style.position = 'absolute';
        particlesContainer.style.top = '0';
        particlesContainer.style.left = '0';
        particlesContainer.style.width = '100%';
        particlesContainer.style.height = '100%';
        particlesContainer.style.overflow = 'hidden';
        particlesContainer.style.pointerEvents = 'none';
        
        // Create particles with professional colors
        const particleCount = 60;
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
        
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          
          // Random position
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          
          // Random size - keeping these smaller and more subtle
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
          
          // Add smooth animation with keyframes
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
      
      // Create wave animation effects
      if (waveAnimationRef.current) {
        const waveContainer = waveAnimationRef.current;
        waveContainer.innerHTML = '';
        
        // Create wave elements
        for (let i = 0; i < 3; i++) {
          const wave = document.createElement('div');
          wave.className = `wave wave-${i+1}`;
          waveContainer.appendChild(wave);
          
          // Animate each wave
          gsap.to(wave, {
            y: -10,
            x: i * 5,
            duration: 2 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
          });
        }
      }
    } catch (error) {
      console.error("Error creating animations:", error);
    }
  }, []);

  // Text animation sequence with GSAP
  useEffect(() => {
    try {
      if (textContainerRef.current) {
        const timeline = gsap.timeline({
          defaults: { duration: 0.8, ease: "power3.out" }
        });
        
        // Create text animation for each heading
        const title = textContainerRef.current.querySelector('.hero-title');
        const subtitle = textContainerRef.current.querySelector('.hero-subtitle');
        const description = textContainerRef.current.querySelector('.hero-description');
        const cta = textContainerRef.current.querySelector('.cta-button');
        
        if (title && subtitle && description && cta) {
          timeline
            .from(title, {
              opacity: 0,
              y: 30,
              duration: 1
            })
            .from(subtitle, {
              opacity: 0,
              y: 20,
              duration: 0.8
            }, "-=0.4")
            .from(description, {
              opacity: 0,
              y: 20,
              duration: 0.8
            }, "-=0.3")
            .from(cta, {
              opacity: 0,
              y: 20,
              scale: 0.9,
              duration: 0.6
            }, "-=0.2");
        }
        
        // Animate feature cards with stagger
        const cards = document.querySelectorAll('.feature-card');
        gsap.from(cards, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.4)",
          delay: 1
        });
      }
    } catch (error) {
      console.error("Error animating text:", error);
    }
  }, []);

  // Page transitions using GSAP
  useEffect(() => {
    try {
      // Create fade-in animation on component mount
      if (introContainerRef.current) {
        gsap.fromTo(introContainerRef.current, 
          { opacity: 0 },
          { 
            opacity: 1, 
            duration: 1, 
            ease: "power2.out" 
          }
        );
      }
    } catch (error) {
      console.error("Error with page transitions:", error);
    }

    return () => {
      // Clean up any animations on unmount
      if (introContainerRef.current) {
        gsap.killTweensOf(introContainerRef.current);
      }
    };
  }, []);

  // Handle click on Get Started button
  const handleGetStartedClick = () => {
    if (onComplete && introContainerRef.current) {
      // Create exit animation
      gsap.to(introContainerRef.current, {
        opacity: 0, 
        duration: 0.8,
        ease: "power2.in",
        onComplete: onComplete
      });
    }
  };

  return (
    <div 
      ref={introContainerRef} 
      className="intro-container"
    >
      {/* Gradient background */}
      <div 
        ref={gradientBackgroundRef} 
        className="gradient-background"
      ></div>
      
      {/* Particles effect */}
      <div 
        ref={particlesRef} 
        className="particles-container"
      ></div>
      
      {/* Wave animation */}
      <div 
        ref={waveAnimationRef} 
        className="wave-container"
      ></div>
      
      {/* Main content */}
      <div 
        ref={textContainerRef} 
        className="content-container"
      >
        <div className="hero-section">
          <h1 className="hero-title">
            Advanced LaTeX Generation
          </h1>
          <h2 className="hero-subtitle">
            Powered by AI
          </h2>
          <p className="hero-description">
            Transform plain text into professional LaTeX documents in seconds
          </p>
          
          <button 
            className="cta-button"
            onClick={handleGetStartedClick}
            aria-label="Get started with AI LaTeX Generator"
          >
            Get Started
          </button>
        </div>
        
        {/* Feature cards */}
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Equation Processing</h3>
            <p>Complex mathematical expressions converted to perfect LaTeX syntax with precise formatting</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3>Adaptive Intelligence</h3>
            <p>Our AI adapts to your research style and preferences to deliver personalized LaTeX documents</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <h3>Instant Compilation</h3>
            <p>View and download your compiled documents immediately with live preview and PDF export</p>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <span>Scroll to Explore</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </div>
    </div>
  );
};

export default HyperIntro;