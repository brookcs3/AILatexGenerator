import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDomain = process.env.SITE_DOMAIN || 'https://aitexgen.com';

const robots = `User-agent: *
Allow: /

# Don't index administrative or authentication pages
Disallow: /api/
Disallow: /verify-email
Disallow: /success

# Sitemap location
Sitemap: ${siteDomain}/sitemap.xml\n`;

await fs.promises.writeFile(path.resolve(__dirname, '../public/robots.txt'), robots);
console.log('robots.txt generated for', siteDomain);
