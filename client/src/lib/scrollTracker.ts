import { trackEvent } from './analytics';

export function initScrollDepthTracking() {
  if (typeof window === 'undefined') return;
  const depths = [25, 50, 75, 100];
  const fired: Record<number, boolean> = {};

  function onScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / docHeight) * 100;
    depths.forEach((d) => {
      if (!fired[d] && scrolled >= d) {
        fired[d] = true;
        trackEvent('scroll_depth', { percent: d });
      }
    });
    if (scrolled >= 100) {
      window.removeEventListener('scroll', onScroll);
    }
  }

  window.addEventListener('scroll', onScroll);
}
