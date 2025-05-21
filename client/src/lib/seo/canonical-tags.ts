/**
 * Canonical Tags Manager
 * 
 * This module helps ensure proper canonical URLs are set
 * for all pages to avoid duplicate content issues.
 */

import { logger } from '@/lib/logger';

/**
 * Add or update the canonical URL tag in the document head
 * 
 * @param url Optional custom URL to use (defaults to current URL without query params)
 */
export function setCanonicalUrl(url?: string): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    // Default to current URL without search parameters if no URL provided
    const canonicalUrl = url || `${window.location.origin}${window.location.pathname}`;
    
    // Check if a canonical tag already exists
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    
    if (canonicalTag) {
      // Update existing tag
      canonicalTag.setAttribute('href', canonicalUrl);
    } else {
      // Create new tag
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      canonicalTag.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalTag);
    }
    
    logger(`Canonical URL set to: ${canonicalUrl}`);
  } catch (error) {
    logger('Error setting canonical URL:', error);
  }
}

/**
 * Initialize canonical URL management
 * - Sets canonical tags for the current page
 * - Updates canonical tags when the route changes
 */
export function initCanonicalUrls(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }

  // Set canonical URL on page load
  setCanonicalUrl();

  // Listen for route changes to update canonical URLs
  window.addEventListener('popstate', () => {
    setCanonicalUrl();
  });

  // For single-page applications with client-side routing
  // Monitor location changes via an interval (fallback solution)
  let lastPath = window.location.pathname;
  
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      setCanonicalUrl();
    }
  }, 1000);
}

/**
 * Generate a site map in the correct format from a list of paths
 * 
 * @param paths Array of site paths (without domain)
 * @param baseUrl The base URL of the site
 */
export function generateSitemap(paths: string[], baseUrl: string = 'https://aitexgen.com'): string {
  const now = new Date().toISOString();
  
  const urls = paths.map(path => {
    // Ensure path starts with /
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `
  <url>
    <loc>${baseUrl}${formattedPath}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`;
}