import { useEffect, useState, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * A component that fades in its children on mount
 * Use this to create smooth page transitions
 */
export default function FadeIn({ 
  children, 
  duration = 400, 
  delay = 100, 
  className = '' 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'ease-in-out'
      }}
    >
      {children}
    </div>
  );
}