import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDomain = process.env.SITE_DOMAIN || 'https://aitexgen.com';

const routes = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/document-history',
  '/template/article',
  '/template/presentation',
];

const lastmod = new Date().toISOString();

const urlset = routes
  .map((route) => {
    const loc = route.startsWith('/') ? `${siteDomain}${route}` : route;
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;

await fs.promises.writeFile(
  path.resolve(__dirname, '../public/sitemap.xml'),
  xml
);
console.log('sitemap.xml generated for', siteDomain);
