import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE = process.env.SITE_DOMAIN || 'http://localhost:5000';
const PAGES = ['/'];

async function run() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const results = {};
  for (const page of PAGES) {
    const url = new URL(page, SITE).href;
    const runnerResult = await lighthouse(url, { port: chrome.port });
    results[page] = {
      performance: runnerResult.lhr.categories.performance.score,
      accessibility: runnerResult.lhr.categories.accessibility.score,
      bestPractices: runnerResult.lhr.categories['best-practices'].score,
      seo: runnerResult.lhr.categories.seo.score
    };
  }
  await chrome.kill();
  const outPath = path.resolve(__dirname, '../analytics/baseline.json');
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await fs.promises.writeFile(outPath, JSON.stringify(results, null, 2));
  console.log('Baseline metrics saved to', outPath);
}

run().catch(err => {
  console.error('Lighthouse run failed:', err);
  process.exit(1);
});
