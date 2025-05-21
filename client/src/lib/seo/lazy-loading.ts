/**
 * Lazy Loading Helper
 * 
 * This module helps with proper lazy loading of content 
 * to improve initial page load performance
 */

import { logger } from '@/lib/logger';

/**
 * Apply lazy loading to all images that don't already have it
 */
export function applyLazyLoadingToImages(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Find all images without the loading attribute
  const images = document.querySelectorAll('img:not([loading])');
  
  // Add loading="lazy" to all found images
  images.forEach(img => {
    // Only apply to images that are below the fold
    // (further down than the initial viewport)
    const rect = img.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      img.setAttribute('loading', 'lazy');
      logger('Applied lazy loading to image:', (img as HTMLImageElement).src);
    }
  });
}

/**
 * Set up intersection observer for lazy loading custom elements
 * 
 * @param selector CSS selector for elements to observe
 * @param callback Function to call when element enters viewport
 * @param options IntersectionObserver options
 */
export function setupLazyObserver(
  selector: string, 
  callback: (element: Element) => void,
  options: IntersectionObserverInit = { rootMargin: '200px 0px' } // Load items 200px before they enter viewport
): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target); // Stop observing once loaded
      }
    });
  }, options);

  // Start observing each element
  elements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Lazy load an image element when it enters the viewport
 * 
 * @param imgElement - The image element to lazy load
 */
export function lazyLoadImage(imgElement: HTMLImageElement): void {
  // Skip if already loaded
  if (imgElement.src === imgElement.dataset.src) return;
  
  // Get the source from data-src attribute
  const src = imgElement.dataset.src;
  if (!src) return;
  
  // Start loading the image
  const img = new Image();
  img.onload = () => {
    imgElement.src = src;
    imgElement.classList.add('loaded');
    imgElement.removeAttribute('data-src');
  };
  img.src = src;
}

/**
 * Defer loading of non-critical JavaScript
 * 
 * @param scriptUrl URL of the script to defer
 * @param async Whether to load the script asynchronously
 */
export function loadDeferredScript(scriptUrl: string, async: boolean = true): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = async;
      script.defer = true;
      
      script.onload = () => {
        logger(`Loaded deferred script: ${scriptUrl}`);
        resolve();
      };
      
      script.onerror = (err) => {
        logger(`Failed to load deferred script: ${scriptUrl}`, err);
        reject(err);
      };
      
      document.body.appendChild(script);
    } catch (error) {
      logger(`Error setting up deferred script: ${scriptUrl}`, error);
      reject(error);
    }
  });
}

/**
 * Initialize lazy loading
 */
export function initLazyLoading(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }
  
  // Apply lazy loading to images after initial render
  window.addEventListener('load', () => {
    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        applyLazyLoadingToImages();
      });
    } else {
      setTimeout(() => {
        applyLazyLoadingToImages();
      }, 1000);
    }
  });
  
  // Set up lazy loading for custom data-src images
  setupLazyObserver('img[data-src]', (element) => {
    if (element instanceof HTMLImageElement) {
      lazyLoadImage(element);
    }
  });
}