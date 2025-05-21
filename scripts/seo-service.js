import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.SEO_SERVICE_PORT || 5003;
const SEO_FILE = path.resolve(__dirname, '../public/seo.json');

await fs.promises.mkdir(path.dirname(SEO_FILE), { recursive: true });

const app = express();
app.use(express.json());

async function optimize(report) {
  const data = {
    lastUpdated: new Date().toISOString(),
    recommendedPages: report.topPages || [],
    topics: report.generatedTopics || []
  };
  await fs.promises.writeFile(SEO_FILE, JSON.stringify(data, null, 2));
}

app.post('/optimize', async (req, res) => {
  await optimize(req.body.report || {});
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`SEO service running on port ${PORT}`);
});
