/**
 * Lighthouse Metrics Tracker
 * 
 * This module helps track core web vitals and performance metrics
 * to establish a baseline for SEO and performance improvements.
 */

import { logger } from '@/lib/logger';

// Core Web Vitals thresholds based on Google's recommendations
export const CWV_THRESHOLDS = {
  LCP: {
    GOOD: 2500,    // ms - Largest Contentful Paint
    NEEDS_IMPROVEMENT: 4000 // ms
  },
  FID: {
    GOOD: 100,     // ms - First Input Delay
    NEEDS_IMPROVEMENT: 300  // ms
  },
  CLS: {
    GOOD: 0.1,     // score - Cumulative Layout Shift
    NEEDS_IMPROVEMENT: 0.25 // score
  },
  TTI: {
    GOOD: 3500,    // ms - Time to Interactive
    NEEDS_IMPROVEMENT: 7500 // ms
  }
};

interface PerformanceMetrics {
  lcp?: number;   // Largest Contentful Paint
  fid?: number;   // First Input Delay
  cls?: number;   // Cumulative Layout Shift
  ttfb?: number;  // Time to First Byte
  fcp?: number;   // First Contentful Paint
  tti?: number;   // Time to Interactive
  navigationStart: number;
}

/**
 * Collect performance metrics using browser Performance API
 * This provides real user monitoring (RUM) of core web vitals
 */
export function collectPerformanceMetrics(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return;
  }

  // Wait for the page to finish loading
  window.addEventListener('load', () => {
    // Use setTimeout to ensure we capture metrics after page is fully rendered
    setTimeout(() => {
      const metrics: PerformanceMetrics = {
        navigationStart: performance.timing.navigationStart,
      };

      // Use Performance API to get navigation timing data
      if (performance.timing) {
        const navTiming = performance.timing;
        metrics.ttfb = navTiming.responseStart - navTiming.navigationStart;
        metrics.fcp = navTiming.domContentLoadedEventEnd - navTiming.navigationStart;
      }

      // Use newer Performance Observer for Core Web Vitals if available
      if ('PerformanceObserver' in window) {
        try {
          // Check for LCP (Largest Contentful Paint)
          const lcpEntries = performance.getEntriesByType('paint')
            .filter(entry => entry.name === 'largest-contentful-paint');
          
          if (lcpEntries.length > 0) {
            metrics.lcp = lcpEntries[0].startTime;
          }

          // Get CLS (Cumulative Layout Shift) score if available
          const clsEntries = performance.getEntriesByType('layout-shift');
          if (clsEntries.length > 0) {
            // Sum all layout shift scores that occurred without user input
            // within 500ms of each other
            metrics.cls = clsEntries
              .filter((entry: any) => !entry.hadRecentInput)
              .reduce((total: number, entry: any) => total + entry.value, 0);
          }
          
        } catch (error) {
          logger('Error collecting performance metrics:', error);
        }
      }

      // Log the gathered metrics
      logger('Performance metrics:', metrics);

      // Send metrics to the backend for analysis and storage
      try {
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics)
        });
      } catch (e) {
        // Silently fail - we don't want to affect user experience
        logger('Failed to send performance metrics');
      }
    }, 3000); // Wait 3 seconds after load to collect stable metrics
  });

  // Listen for First Input Delay
  if ('PerformanceObserver' in window) {
    try {
      const fidObserver = new PerformanceObserver((entries) => {
        const firstInput = entries.getEntries()[0];
        if (firstInput) {
          const fid = (firstInput as any).processingStart - (firstInput as any).startTime;
          logger('FID:', fid);
          
          // Send FID metric to backend
          try {
            fetch('/api/analytics/performance/fid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fid })
            });
          } catch (e) {
            // Silently fail
            logger('Failed to send FID metric');
          }
        }
      });
      
      // Only observe first-input
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      logger('Error setting up FID observer:', e);
    }
  }
}

/**
 * Initialize performance tracking
 */
export function initPerformanceTracking(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }
  
  // Start collecting metrics
  collectPerformanceMetrics();
  
  // Log page path for identifying which routes have performance issues
  logger('Tracking performance for:', window.location.pathname);
}