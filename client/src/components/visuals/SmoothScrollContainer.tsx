import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollManager from '@/lib/locomotive-scroll-manager';

interface SmoothScrollProps {
  children: React.ReactNode;
}

/**
 * Wraps content with Locomotive Scroll and triggers basic
 * GSAP fade-in animations as sections enter the viewport.
 */
export default function SmoothScrollContainer({ children }: SmoothScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ScrollManager.init(container, { smooth: true });

    const handleScroll = () => {
      const elements = container.querySelectorAll('[data-reveal]');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && !el.classList.contains('revealed')) {
          el.classList.add('revealed');
          gsap.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        }
      });
    };

    ScrollManager.onScroll(handleScroll);
    handleScroll();

    return () => {
      ScrollManager.offScroll(handleScroll);
      ScrollManager.destroy();
    };
  }, []);

  return (
    <div data-scroll-container ref={containerRef}>
      {children}
    </div>
  );
}
