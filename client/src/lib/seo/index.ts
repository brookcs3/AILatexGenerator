/**
 * SEO Tools Main Export
 * 
 * This file exports all SEO-related functionality from a single entry point
 */

// Re-export all SEO-related utilities
export * from './canonical-tags';
export * from './lazy-loading';
export * from './lighthouse-metrics';
export * from './structured-data';
export * from './meta-tags';

import { initCanonicalUrls } from './canonical-tags';
import { initLazyLoading } from './lazy-loading';
import { initPerformanceTracking } from './lighthouse-metrics';
import { initStructuredData } from './structured-data';
import { initMetaTags } from './meta-tags';
import { logger } from '@/lib/logger';

/**
 * Initialize all SEO tools
 * 
 * This function should be called once in your app's entry point
 */
export function initSEO(): void {
  logger('Initializing SEO tools...');
  
  // Initialize individual components
  initCanonicalUrls();
  initLazyLoading();
  initPerformanceTracking();
  initStructuredData();
  initMetaTags();
  
  logger('SEO tools initialized');
}