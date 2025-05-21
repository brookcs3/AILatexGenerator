import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export function useABVariant(key: string, variants: string[]): string {
  const [variant, setVariant] = useState('');

  useEffect(() => {
    if (variants.length === 0) return;
    let stored = localStorage.getItem(`ab_${key}`);
    if (!stored || !variants.includes(stored)) {
      stored = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(`ab_${key}`, stored);
      trackEvent('ab_assign', { key, variant: stored });
    }
    setVariant(stored);
  }, [key, variants]);

  return variant;
}
