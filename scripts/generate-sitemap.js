import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDomain = process.env.SITE_DOMAIN || 'https://aitexgen.com';

const routes = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/auth', changefreq: 'monthly', priority: 0.8 },
  { path: '/document-history', changefreq: 'daily', priority: 0.7 },
  { path: '/account', changefreq: 'monthly', priority: 0.7 },
  { path: '/subscribe', changefreq: 'monthly', priority: 0.8 },
  { path: '/refill', changefreq: 'monthly', priority: 0.7 },
  { path: '/template/article', changefreq: 'monthly', priority: 0.8 },
  { path: '/template/presentation', changefreq: 'monthly', priority: 0.8 },
  { path: '/template/letter', changefreq: 'monthly', priority: 0.7 },
  { path: '/template/report', changefreq: 'monthly', priority: 0.7 }
];

const lastmod = new Date().toISOString().split('T')[0];

const entries = routes
  .map(
    (route) => `  <url>\n    <loc>${siteDomain}${route.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

await fs.promises.writeFile(
  path.resolve(__dirname, '../public/sitemap.xml'),
  sitemap
);

console.log('sitemap.xml generated for', siteDomain);
