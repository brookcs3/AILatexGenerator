import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.CONTENT_SERVICE_PORT || 5001;
const TREND_URL = 'https://trends.google.com/trends/api/dailytrends?geo=US';
const GENERATED_DIR = path.resolve(__dirname, '../content/blog/generated');

await fs.promises.mkdir(GENERATED_DIR, { recursive: true });

const app = express();
app.use(express.json());

async function fetchTrendingTopics() {
  try {
    const res = await axios.get(TREND_URL);
    const jsonText = res.data.replace(/^[^({]+/, '');
    const data = JSON.parse(jsonText);
    return data.default.trendingSearchesDays[0].trendingSearches.map(t => t.title.query);
  } catch (err) {
    console.error('Error fetching trends', err.message);
    return [];
  }
}

async function generateArticle(topic) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set; generating placeholder content');
    return `# ${topic}\n\nContent generation skipped.`;
  }
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a professional copywriter.' },
      { role: 'user', content: `Write a concise 3 paragraph blog post about ${topic}.` }
    ],
    model: 'gpt-4o'
  });
  return completion.choices[0].message.content.trim();
}

async function generateAndStoreContent() {
  const topics = await fetchTrendingTopics();
  for (const topic of topics) {
    const article = await generateArticle(topic);
    const filename = path.join(GENERATED_DIR, `${topic.replace(/\s+/g, '_')}.md`);
    await fs.promises.writeFile(filename, article);
  }
  return topics;
}

app.get('/generate', async (req, res) => {
  const topics = await generateAndStoreContent();
  try {
    await axios.post(`http://localhost:${process.env.ANALYTICS_SERVICE_PORT || 5002}/analyze`, { topics });
  } catch (e) {
    console.error('Failed to notify analytics service', e.message);
  }
  res.json({ success: true, topics });
});

app.listen(PORT, () => {
  console.log(`Content service running on port ${PORT}`);
  setInterval(() => {
    axios.get(`http://localhost:${PORT}/generate`).catch(() => {});
  }, 1000 * 60 * 60); // hourly
});
