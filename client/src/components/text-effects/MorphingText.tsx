import React, { useEffect, useId } from 'react';
import './MorphingText.css';

interface MorphingTextProps {
  texts?: string[];
  className?: string;
}

const MorphingText: React.FC<MorphingTextProps> = ({ 
  texts = ["AI LATEX GENERATOR", "ai latex generator"],
  className = ""
}) => {
  // Generate unique IDs for this component instance
  const uniqueId = useId();
  const text1Id = `text1-${uniqueId}`;
  const text2Id = `text2-${uniqueId}`;
  const containerId = `container-${uniqueId}`;
  const filterId = `threshold-${uniqueId}`;
  
  useEffect(() => {
    const text1 = document.getElementById(text1Id);
    const text2 = document.getElementById(text2Id);
    
    if (!text1 || !text2) return;
    
    const elts = { text1, text2 };
    
    // Controls the speed of morphing.
    const morphTime = 2;
    const cooldownTime = 3;
    
    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    
    elts.text1.textContent = texts[textIndex % texts.length];
    elts.text2.textContent = texts[(textIndex + 1) % texts.length];
    
    function doMorph() {
      morph -= cooldown;
      cooldown = 0;
      
      let fraction = morph / morphTime;
      
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      
      setMorph(fraction);
    }
    
    // A lot of the magic happens here, this is what applies the blur filter to the text.
    function setMorph(fraction: number) {
      // Add cosine easing for smoother transitions
      fraction = Math.cos(fraction * Math.PI) / -2 + 0.5;
      
      elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      
      fraction = 1 - fraction;
      elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      
      elts.text1.textContent = texts[textIndex % texts.length];
      elts.text2.textContent = texts[(textIndex + 1) % texts.length];
    }
    
    function doCooldown() {
      morph = 0;
      
      elts.text2.style.filter = "";
      elts.text2.style.opacity = "100%";
      
      elts.text1.style.filter = "";
      elts.text1.style.opacity = "0%";
    }
    
    // Animation loop, which is called every frame.
    function animate() {
      const animationId = requestAnimationFrame(animate);
      
      let newTime = new Date();
      let shouldIncrementIndex = cooldown > 0;
      let dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      
      cooldown -= dt;
      
      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex++;
        }
        
        doMorph();
      } else {
        doCooldown();
      }
      
      return animationId;
    }
    
    // Start the animation.
    const animationId = animate();
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [texts]);
  
  return (
    <div className={`morphing-text-container ${className}`}>
      {/* The two texts */}
      <div id={containerId} className="morphing-container" style={{ filter: `url(#${filterId}) blur(0.6px)` }}>
        <span id={text1Id} className="morphing-text"></span>
        <span id={text2Id} className="morphing-text"></span>
      </div>

      {/* The SVG filter used to create the merging effect */}
      <svg className="filters-svg">
        <defs>
          <filter id={filterId}>
            {/* Threshold effect - pixels with high enough opacity are set to full opacity */}
            <feColorMatrix 
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default MorphingText;