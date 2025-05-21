import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.ANALYTICS_SERVICE_PORT || 5002;
const LOG_FILE = path.resolve(__dirname, '../analytics/logs.json');
const REPORT_FILE = path.resolve(__dirname, '../analytics/report.json');

await fs.promises.mkdir(path.dirname(LOG_FILE), { recursive: true });

const app = express();
app.use(express.json());

async function analyze(topics = []) {
  const logsRaw = await fs.promises.readFile(LOG_FILE, 'utf8').catch(() => '[]');
  const logs = JSON.parse(logsRaw);
  const pageCounts = logs.reduce((acc, log) => {
    acc[log.page] = (acc[log.page] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]);
  const report = {
    generatedTopics: topics,
    topPages: sorted.slice(0, 5).map(([page]) => page)
  };
  await fs.promises.writeFile(REPORT_FILE, JSON.stringify(report, null, 2));
  return report;
}

app.post('/analyze', async (req, res) => {
  const topics = req.body.topics || [];
  const report = await analyze(topics);
  try {
    await axios.post(`http://localhost:${process.env.SEO_SERVICE_PORT || 5003}/optimize`, { report });
  } catch (e) {
    console.error('Failed to notify SEO service', e.message);
  }
  res.json({ success: true, report });
});

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});
