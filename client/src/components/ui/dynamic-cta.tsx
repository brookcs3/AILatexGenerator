import { useEffect } from 'react';
import { useABVariant } from '@/hooks/useABVariant';
import { trackEvent } from '@/lib/analytics';
import { UserContext } from '@/App';
import { useContext } from 'react';

interface DynamicCTAProps {
  onClick: () => void;
}

export default function DynamicCTA({ onClick }: DynamicCTAProps) {
  const user = useContext(UserContext);
  const variant = useABVariant('cta', ['A', 'B']);

  useEffect(() => {
    if (variant) {
      trackEvent('cta_variant_view', { variant });
    }
  }, [variant]);

  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const isFromGoogle = referrer.includes('google');

  let label = 'Get Started';
  if (variant === 'A') {
    label = user ? 'Upgrade Now' : 'Start for Free';
  } else if (variant === 'B') {
    label = isFromGoogle ? 'Try the Demo' : 'Join Today';
  }

  return (
    <button
      className="cta-button"
      onClick={() => {
        trackEvent('cta_click', { variant });
        onClick();
      }}
      aria-label={label}
    >
      {label}
    </button>
  );
}
