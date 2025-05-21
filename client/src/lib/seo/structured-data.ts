/**
 * Structured Data Manager
 * 
 * This module provides tools for adding structured data (JSON-LD)
 * to improve search engine understanding of page content and
 * enhance rich search results.
 */

import { logger } from '../logger';

// Base site information (keep in sync with meta-tags.ts)
const siteInfo = {
  name: 'AI LaTeX Generator',
  domain: 'aitexgen.com',
  url: 'https://aitexgen.com',
  logo: 'https://aitexgen.com/generated-icon.png',
  defaultDescription: 'Generate professional LaTeX documents with AI assistance. Create papers, slides, and academic content with ease using our powerful LaTeX generator.',
  defaultImage: 'https://aitexgen.com/og-image.jpg',
  twitterHandle: '@aitexgen',
  author: 'AI LaTeX Generator Team'
};

/**
 * Generate and add structured data for the website
 * @param pageType Type of page to generate structured data for
 * @param customData Any custom data to include
 */
export function addStructuredData(
  pageType: 'home' | 'tool' | 'article' | 'faq' | 'pricing',
  customData: Record<string, any> = {}
): void {
  // Don't run in non-browser environments
  if (typeof document === 'undefined') {
    return;
  }

  let structuredData: Record<string, any> = {};

  // Generate appropriate structured data based on page type
  switch (pageType) {
    case 'home':
      structuredData = generateWebsiteData();
      break;
    case 'tool':
      structuredData = generateSoftwareApplicationData(customData);
      break;
    case 'article':
      structuredData = generateArticleData(customData);
      break;
    case 'faq':
      structuredData = generateFAQData(customData);
      break;
    case 'pricing':
      structuredData = generatePricingData(customData);
      break;
    default:
      structuredData = generateWebsiteData();
  }

  // Add the structured data to the page
  injectStructuredData(structuredData);

  logger('Added structured data for:', pageType);
}

/**
 * Generate structured data for the website
 */
function generateWebsiteData(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteInfo.name,
    url: siteInfo.url,
    description: siteInfo.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteInfo.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generate structured data for the LaTeX generator tool
 */
function generateSoftwareApplicationData(customData: Record<string, any>): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: customData.name || 'AI LaTeX Generator',
    applicationCategory: 'WebApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly'
    },
    description: customData.description || 'Generate professional LaTeX documents with AI assistance. Create papers, slides, and academic content with ease.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '156'
    }
  };
}

/**
 * Generate structured data for blog articles and tutorials
 */
function generateArticleData(customData: Record<string, any>): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: customData.headline || 'LaTeX Document Creation Guide',
    image: [customData.image || siteInfo.defaultImage],
    datePublished: customData.datePublished || new Date().toISOString(),
    dateModified: customData.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: customData.author || siteInfo.author
    },
    publisher: {
      '@type': 'Organization',
      name: siteInfo.name,
      logo: {
        '@type': 'ImageObject',
        url: siteInfo.logo
      }
    },
    description: customData.description || 'Learn how to create professional LaTeX documents using our AI LaTeX Generator.'
  };
}

/**
 * Generate structured data for FAQ pages
 */
function generateFAQData(customData: Record<string, any>): Record<string, any> {
  // Default FAQ items if none provided
  const faqItems = customData.faqItems || [
    {
      question: 'What is AI LaTeX Generator?',
      answer: 'AI LaTeX Generator is an online tool that uses artificial intelligence to generate professional LaTeX documents from simple text inputs.'
    },
    {
      question: 'Do I need to know LaTeX to use this tool?',
      answer: 'No, our AI-powered tool allows you to create professional LaTeX documents without any prior knowledge of LaTeX syntax.'
    }
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item: any) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

/**
 * Generate structured data for pricing pages
 */
function generatePricingData(customData: Record<string, any>): Record<string, any> {
  // Default pricing tiers if none provided
  const pricingItems = customData.pricingItems || [
    {
      name: 'Free',
      price: '0',
      description: '3 generations per month',
      currency: 'USD'
    },
    {
      name: 'Basic',
      price: '0.99',
      description: '100 requests per month',
      currency: 'USD'
    },
    {
      name: 'Pro',
      price: '6.99',
      description: '1,200 requests per month',
      currency: 'USD'
    }
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: customData.name || 'AI LaTeX Generator',
    description: customData.description || 'Professional LaTeX document generation with AI assistance',
    offers: pricingItems.map((item: any) => ({
      '@type': 'Offer',
      name: item.name,
      price: item.price,
      priceCurrency: item.currency,
      description: item.description
    }))
  };
}

/**
 * Inject structured data into the page
 */
function injectStructuredData(data: Record<string, any>): void {
  // Remove any existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());

  // Create and add a new script element with the structured data
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Initialize structured data management
 */
export function initStructuredData(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }

  // Set initial structured data based on current path
  updateStructuredDataForCurrentPage();

  // Listen for route changes to update structured data
  window.addEventListener('popstate', () => {
    updateStructuredDataForCurrentPage();
  });

  // For single-page applications with client-side routing
  // Monitor location changes via an interval (fallback solution)
  let lastPath = window.location.pathname;
  
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      updateStructuredDataForCurrentPage();
    }
  }, 1000);
}

/**
 * Update structured data based on current page
 */
function updateStructuredDataForCurrentPage(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }

  const path = window.location.pathname;

  // Set structured data based on path
  if (path === '/') {
    addStructuredData('home');
  } else if (path === '/app') {
    addStructuredData('tool', {
      name: 'AI LaTeX Editor',
      description: 'Our AI-powered LaTeX editor makes it easy to create publication-ready documents. No LaTeX knowledge required.'
    });
  } else if (path.startsWith('/how-to') || path.startsWith('/blog')) {
    // Extract article information from page
    const headline = document.querySelector('h1')?.textContent || 'LaTeX Guide';
    const datePublished = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || new Date().toISOString();
    
    addStructuredData('article', {
      headline,
      datePublished,
      dateModified: datePublished
    });
  } else if (path === '/faq') {
    // Dynamically build FAQ items from the page content
    const faqItems: { question: string; answer: string }[] = [];
    
    const questionElements = document.querySelectorAll('.faq-question, h3');
    questionElements.forEach(questionEl => {
      const question = questionEl.textContent || '';
      const answerEl = questionEl.nextElementSibling;
      const answer = answerEl?.textContent || '';
      
      if (question && answer) {
        faqItems.push({ question, answer });
      }
    });
    
    addStructuredData('faq', { faqItems });
  } else if (path === '/subscribe' || path === '/pricing') {
    addStructuredData('pricing');
  } else {
    // For other pages, add generic website data
    addStructuredData('home');
  }
}