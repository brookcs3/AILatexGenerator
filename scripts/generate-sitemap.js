import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDomain = process.env.SITE_DOMAIN || 'https://aitexgen.com';
const pagesDir = path.resolve(__dirname, '../client/src/pages');

const ignorePages = new Set([
  'template-redirect',
  'not-found',
  'intro-page'
]);

function routeFromFile(name) {
  const base = name.replace(/\.tsx$/, '');
  if (base === 'home') return '/app';
  if (base === 'index') return '/';
  return `/${base}`;
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));
const routes = files
  .map(f => f.replace(/\.tsx$/, ''))
  .filter(p => !ignorePages.has(p))
  .map(p => routeFromFile(p));

const lastmod = new Date().toISOString().split('T')[0];

const urls = routes.map(route => {
  const priority = route === '/' ? '1.0' : '0.7';
  return `  <url>\n    <loc>${siteDomain}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

await fs.promises.writeFile(path.resolve(__dirname, '../public/sitemap.xml'), xml);
console.log('Sitemap generated with', routes.length, 'urls');
