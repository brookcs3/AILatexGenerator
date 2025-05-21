/**
 * Meta Tags Manager
 * 
 * This module helps manage meta tags for SEO purposes,
 * ensuring each page has appropriate titles, descriptions and 
 * OpenGraph tags for social sharing.
 */

import { logger } from '../logger';

// Base site information
const siteInfo = {
  name: 'AI LaTeX Generator',
  domain: 'aitexgen.com',
  url: 'https://aitexgen.com',
  logo: 'https://aitexgen.com/generated-icon.png',
  defaultDescription: 'Generate professional LaTeX documents with AI assistance. Create papers, slides, and academic content with ease using our powerful LaTeX generator.',
  defaultImage: 'https://aitexgen.com/og-image.jpg',
  twitterHandle: '@aitexgen'
};

interface MetaTagsOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  robots?: string;
  canonical?: string;
}

/**
 * Set all meta tags for a page
 * 
 * @param options Meta tag configuration
 */
export function setMetaTags(options: MetaTagsOptions = {}): void {
  // Don't run in non-browser environments
  if (typeof document === 'undefined') {
    return;
  }

  // Set defaults
  const {
    title = siteInfo.name,
    description = siteInfo.defaultDescription,
    keywords = [
      'LaTeX', 'LaTeX generator', 'AI', 'document generation',
      'academic writing', 'LaTeX templates', 'LaTeX editor', 'AI document editor'
    ],
    ogType = 'website',
    ogImage = siteInfo.defaultImage,
    ogUrl = typeof window !== 'undefined' ? window.location.href : siteInfo.url,
    twitterCard = 'summary_large_image',
    robots = 'index, follow',
    canonical = typeof window !== 'undefined' ? window.location.href : siteInfo.url
  } = options;

  // Format title with site name if it's not already included
  const formattedTitle = title.includes(siteInfo.name) 
    ? title 
    : `${title} | ${siteInfo.name}`;

  // Core meta tags
  updateMetaTag('title', null, formattedTitle, true);
  updateMetaTag('description', 'name', description);
  updateMetaTag('keywords', 'name', keywords.join(', '));
  updateMetaTag('robots', 'name', robots);

  // Open Graph tags
  updateMetaTag('og:title', 'property', title);
  updateMetaTag('og:description', 'property', description);
  updateMetaTag('og:type', 'property', ogType);
  updateMetaTag('og:image', 'property', ogImage);
  updateMetaTag('og:url', 'property', ogUrl);
  updateMetaTag('og:site_name', 'property', siteInfo.name);

  // Twitter tags
  updateMetaTag('twitter:card', 'name', twitterCard);
  updateMetaTag('twitter:title', 'name', title);
  updateMetaTag('twitter:description', 'name', description);
  updateMetaTag('twitter:image', 'name', ogImage);
  updateMetaTag('twitter:site', 'name', siteInfo.twitterHandle);

  // Canonical URL
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalTag.setAttribute('href', canonical);
  } else {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    canonicalTag.setAttribute('href', canonical);
    document.head.appendChild(canonicalTag);
  }

  logger('Updated meta tags for:', title);
}

/**
 * Update a meta tag, creating it if it doesn't exist
 * 
 * @param name Name or property value of the meta tag
 * @param attribute 'name' or 'property' or null for title
 * @param content Content value for the meta tag
 * @param isTitle Whether this is the page title (not a meta tag)
 */
function updateMetaTag(
  name: string,
  attribute: 'name' | 'property' | null,
  content: string,
  isTitle = false
): void {
  if (isTitle) {
    // Handle page title
    document.title = content;
    return;
  }

  // Handle meta tags
  let metaTag;
  if (attribute) {
    metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
  }

  if (metaTag) {
    // Update existing tag
    metaTag.setAttribute('content', content);
  } else {
    // Create new tag
    metaTag = document.createElement('meta');
    if (attribute) {
      metaTag.setAttribute(attribute, name);
    }
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
  }
}

/**
 * Set page-specific meta tags based on current path
 */
export function updateMetaTagsForCurrentPage(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }

  const path = window.location.pathname;
  
  // Define meta information for each page
  const pageMeta: Record<string, MetaTagsOptions> = {
    '/': {
      title: 'AI LaTeX Generator | Create Professional Academic Documents',
      description: 'Generate professional LaTeX documents with AI assistance. Create papers, slides, and mathematical reports with ease using our powerful LaTeX generator.',
      ogType: 'website'
    },
    '/app': {
      title: 'AI LaTeX Editor | Create LaTeX Documents Online',
      description: 'Our AI-powered LaTeX editor makes it easy to create publication-ready documents. No LaTeX knowledge required - just enter your content and get beautiful results instantly.',
      ogType: 'website'
    },
    '/login': {
      title: 'Log In | AI LaTeX Generator',
      description: 'Log in to your AI LaTeX Generator account to create and manage your professional LaTeX documents.',
      ogType: 'website',
      robots: 'noindex, follow' // Don't index login pages
    },
    '/register': {
      title: 'Sign Up | AI LaTeX Generator',
      description: 'Create an account to access our AI-powered LaTeX document generator. Generate professional academic papers, slides, and reports instantly.',
      ogType: 'website',
      robots: 'noindex, follow' // Don't index registration pages
    },
    '/subscribe': {
      title: 'Subscription Plans | AI LaTeX Generator',
      description: 'Choose a subscription plan for AI LaTeX Generator. Get access to unlimited document creation, premium templates, and advanced AI features.',
      ogType: 'website'
    },
    '/faq': {
      title: 'Frequently Asked Questions | AI LaTeX Generator',
      description: 'Find answers to common questions about our AI LaTeX Generator. Learn how to create documents, use templates, and get the most out of our powerful LaTeX editor.',
      ogType: 'website'
    },
    '/how-to': {
      title: 'LaTeX Tutorials & How-To Guides | AI LaTeX Generator',
      description: 'Learn how to use our AI LaTeX Generator with step-by-step tutorials. Create professional academic papers, presentations, and more without LaTeX knowledge.',
      ogType: 'article'
    },
    '/contact': {
      title: 'Contact Us | AI LaTeX Generator',
      description: 'Get in touch with the AI LaTeX Generator team. We\'re here to help with questions, feedback, and support for our AI-powered document creation tool.',
      ogType: 'website'
    },
    '/privacy-policy': {
      title: 'Privacy Policy | AI LaTeX Generator',
      description: 'AI LaTeX Generator privacy policy. Learn how we collect, use, and protect your data when you use our AI-powered LaTeX document creation service.',
      ogType: 'website',
      robots: 'noindex, follow' // Don't index legal pages
    }
  };

  // Set meta tags based on path
  if (pageMeta[path]) {
    setMetaTags(pageMeta[path]);
  } else if (path.startsWith('/template/')) {
    // Template pages
    const templateType = path.split('/').pop();
    setMetaTags({
      title: `${templateType?.charAt(0).toUpperCase()}${templateType?.slice(1)} LaTeX Template | AI LaTeX Generator`,
      description: `Create professional ${templateType} documents with our AI-powered LaTeX generator. Get publication-ready results with no LaTeX knowledge required.`,
      ogType: 'website',
      keywords: ['LaTeX', `${templateType} template`, 'document generator', 'academic writing', 'LaTeX editor', 'AI document generator']
    });
  } else {
    // Default meta tags for other pages
    setMetaTags();
  }
}

/**
 * Initialize meta tag management
 */
export function initMetaTags(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }

  // Set initial meta tags based on current path
  updateMetaTagsForCurrentPage();

  // Listen for route changes to update meta tags
  window.addEventListener('popstate', () => {
    updateMetaTagsForCurrentPage();
  });

  // For single-page applications with client-side routing
  // Monitor location changes via an interval (fallback solution)
  let lastPath = window.location.pathname;
  
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      updateMetaTagsForCurrentPage();
    }
  }, 1000);
}