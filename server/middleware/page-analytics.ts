import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.resolve(__dirname, '../../analytics/logs.json');

await fs.promises.mkdir(path.dirname(LOG_FILE), { recursive: true });

export async function logPageView(req: Request, _res: Response, next: NextFunction) {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const entry = { page: req.path, ts: new Date().toISOString() };
    try {
      // Try to read the existing log file
      let logs = [];
      try {
        const raw = await fs.promises.readFile(LOG_FILE, 'utf8').catch(() => '[]');
        logs = JSON.parse(raw.trim());
        
        // Make sure logs is an array
        if (!Array.isArray(logs)) {
          logs = [];
        }
      } catch (parseError) {
        // If parsing fails, reset the log file
        console.warn('Analytics log file corrupted, resetting it', parseError);
        logs = [];
      }
      
      // Add the new entry and write back to the file
      logs.push(entry);
      await fs.promises.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (err) {
      console.error('Failed to log page view', err);
    }
  }
  next();
}
