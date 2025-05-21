import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { ServerClient } from 'postmark';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYTICS_PORT = process.env.ANALYTICS_SERVICE_PORT || 5002;
const REPORT_FILE = path.resolve(__dirname, '../analytics/report.json');

async function ensureReport() {
  try {
    const { data } = await axios.post(`http://localhost:${ANALYTICS_PORT}/analyze`, { topics: [] });
    return data.report;
  } catch (err) {
    console.warn('Could not reach analytics service:', err.message);
    if (fs.existsSync(REPORT_FILE)) {
      return JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
    }
  }
  return null;
}

async function sendReportEmail(report) {
  if (!process.env.POSTMARK_API_KEY || !process.env.REPORT_EMAIL) {
    console.error('Missing POSTMARK_API_KEY or REPORT_EMAIL');
    return;
  }
  const client = new ServerClient(process.env.POSTMARK_API_KEY);
  await client.sendEmail({
    From: 'no-reply@aitexgen.com',
    To: process.env.REPORT_EMAIL,
    Subject: 'Weekly Analytics Report',
    HtmlBody: `<pre>${JSON.stringify(report, null, 2)}</pre>`,
    TextBody: JSON.stringify(report, null, 2),
    MessageStream: 'outbound'
  });
  console.log('Report sent to', process.env.REPORT_EMAIL);
}

(async () => {
  const report = await ensureReport();
  if (!report) {
    console.error('No analytics report available');
    process.exit(1);
  }
  await sendReportEmail(report);
})();
