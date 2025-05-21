export function trackEvent(action: string, params: Record<string, any> = {}): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, params);
  }
}
