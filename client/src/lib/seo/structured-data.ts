/**
 * Structured Data Helper
 * 
 * This module helps with adding JSON-LD structured data to pages
 * for improved SEO and rich search results
 */

import { logger } from '@/lib/logger';

// Types of structured data we support
export enum SchemaType {
  ARTICLE = 'Article',
  FAQ = 'FAQPage',
  WEBSITE = 'WebSite',
  ORGANIZATION = 'Organization',
  BREADCRUMB = 'BreadcrumbList',
  PRODUCT = 'Product',
  HOW_TO = 'HowTo'
}

// Base information about the website/organization
const siteInfo = {
  name: 'AI LaTeX Generator',
  url: 'https://aitexgen.com',
  logo: 'https://aitexgen.com/generated-icon.png',
  description: 'Generate professional LaTeX documents with AI assistance. Create papers, slides, and academic content with ease.'
};

/**
 * Add structured data to the document head
 * 
 * @param type - The schema.org type
 * @param data - The structured data object
 */
export function addStructuredData(type: SchemaType, data: any): void {
  if (typeof document === 'undefined') return;

  try {
    // Create full schema with proper context
    const schema = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };

    // Create script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    
    // Add an ID so we can update/remove it later if needed
    const id = `structured-data-${type.toLowerCase()}`;
    script.id = id;
    
    // Remove any existing schema of this type
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }
    
    // Add to document head
    document.head.appendChild(script);
    logger(`Added ${type} structured data`);
  } catch (error) {
    logger('Error adding structured data:', error);
  }
}

/**
 * Create website schema
 */
export function addWebsiteSchema(): void {
  addStructuredData(SchemaType.WEBSITE, {
    name: siteInfo.name,
    url: siteInfo.url,
    description: siteInfo.description,
    potentialAction: {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteInfo.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  });
}

/**
 * Create organization schema
 */
export function addOrganizationSchema(): void {
  addStructuredData(SchemaType.ORGANIZATION, {
    name: siteInfo.name,
    url: siteInfo.url,
    logo: siteInfo.logo,
    description: siteInfo.description,
    sameAs: [
      // Add social profiles here
      'https://twitter.com/aitexgen',
      'https://github.com/brookcs3/AILatexGenerator'
    ]
  });
}

/**
 * Create breadcrumb schema
 * 
 * @param items - Array of breadcrumb items {name, url, position}
 */
export function addBreadcrumbSchema(items: Array<{name: string, url: string, position: number}>): void {
  addStructuredData(SchemaType.BREADCRUMB, {
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url
    }))
  });
}

/**
 * Create article schema
 * 
 * @param article - Article metadata
 */
export function addArticleSchema(article: {
  headline: string;
  description: string;
  authorName: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}): void {
  addStructuredData(SchemaType.ARTICLE, {
    headline: article.headline,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.authorName
    },
    publisher: {
      '@type': 'Organization',
      name: siteInfo.name,
      logo: {
        '@type': 'ImageObject',
        url: siteInfo.logo
      }
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    image: article.image || siteInfo.logo,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href
    }
  });
}

/**
 * Create FAQ schema
 * 
 * @param questions - Array of {question, answer} pairs
 */
export function addFAQSchema(questions: Array<{question: string, answer: string}>): void {
  addStructuredData(SchemaType.FAQ, {
    mainEntity: questions.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  });
}

/**
 * Add canonical tag to the document head
 * 
 * @param url - The canonical URL (defaults to current URL if not provided)
 */
export function addCanonicalTag(url?: string): void {
  if (typeof document === 'undefined') return;
  
  try {
    // Use provided URL or current URL without query parameters
    const canonicalUrl = url || window.location.origin + window.location.pathname;
    
    // Remove any existing canonical tags
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }
    
    // Add new canonical tag
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
    
    logger(`Added canonical tag: ${canonicalUrl}`);
  } catch (error) {
    logger('Error adding canonical tag:', error);
  }
}

/**
 * Initialize structured data for the site
 * - Adds Website and Organization schema by default
 * - Sets up canonical tags
 */
export function initStructuredData(): void {
  // Don't run in non-browser environments
  if (typeof window === 'undefined') return;
  
  // Add default structured data
  addWebsiteSchema();
  addOrganizationSchema();
  
  // Add canonical tag
  addCanonicalTag();
}