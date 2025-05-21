import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

/**
 * Custom cursor with a trailing effect. Uses requestAnimationFrame
 * for smooth updates without blocking the main thread.
 * Only shows on desktop devices and is disabled on touch devices.
 */
export default function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
        window.innerWidth < 768 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0);
    };

    setIsMobile(checkMobile());

    // Re-check on resize
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    
    // Don't run the cursor effect on mobile devices
    if (checkMobile()) {
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    const outer = outerRef.current;
    const dot = dotRef.current;
    if (!outer || !dot) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number;

    const render = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      outer.style.transform = `translate3d(${currentX - outer.offsetWidth / 2}px, ${currentY - outer.offsetHeight / 2}px, 0)`;
      dot.style.transform = `translate3d(${targetX - dot.offsetWidth / 2}px, ${targetY - dot.offsetHeight / 2}px, 0)`;
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    const move = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const down = () => outer.classList.add('active');
    const up = () => outer.classList.remove('active');

    document.addEventListener('mousemove', move);
    document.addEventListener('mousedown', down);
    document.addEventListener('mouseup', up);

    document.body.classList.add('custom-cursor-enabled');

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mousedown', down);
      document.removeEventListener('mouseup', up);
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Don't render the cursor elements on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <>
      <div
        ref={outerRef}
        className="pointer-events-none fixed left-0 top-0 z-50 h-8 w-8 rounded-full border-2 border-white mix-blend-difference transition-transform duration-150 ease-out"
      ></div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-50 h-2 w-2 rounded-full bg-white mix-blend-difference"
      ></div>
    </>
  );
}
