import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface CanonicalLinkProps {
  siteDomain?: string;
}

/**
 * Updates or creates the <link rel="canonical"> tag whenever the route changes.
 * Defaults to using VITE_SITE_DOMAIN env variable or https://aitexgen.com
 */
export default function CanonicalLink({ siteDomain = import.meta.env.VITE_SITE_DOMAIN || 'https://aitexgen.com' }: CanonicalLinkProps) {
  const [location] = useLocation();

  useEffect(() => {
    const href = `${siteDomain.replace(/\/$/, '')}${location || '/'}`;
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [location, siteDomain]);

  return null;
}
