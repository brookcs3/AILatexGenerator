import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create utility for safe analytics logging
const createAnalyticsLogger = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const LOG_FILE = path.resolve(__dirname, '../../analytics/logs.json');
  
  // Ensure directory exists
  await fs.promises.mkdir(path.dirname(LOG_FILE), { recursive: true });
  
  // Initialize with empty array if file doesn't exist
  if (!fs.existsSync(LOG_FILE)) {
    await fs.promises.writeFile(LOG_FILE, '[]');
  }
  
  // Check if file has valid JSON
  try {
    const content = await fs.promises.readFile(LOG_FILE, 'utf8');
    JSON.parse(content);
  } catch (e) {
    // Reset file with empty array if content is invalid
    await fs.promises.writeFile(LOG_FILE, '[]');
  }
  
  return LOG_FILE;
};

// Initialize the log file
let LOG_FILE: string;
createAnalyticsLogger().then(file => {
  LOG_FILE = file;
}).catch(err => {
  console.error('Failed to initialize analytics logger', err);
});

export async function logPageView(req: Request, _res: Response, next: NextFunction) {
  if (req.method === 'GET' && !req.path.startsWith('/api') && LOG_FILE) {
    const entry = { page: req.path, ts: new Date().toISOString() };
    try {
      // Safe reading of logs
      let logs = [];
      try {
        const content = await fs.promises.readFile(LOG_FILE, 'utf8');
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            logs = parsed;
          }
        } catch (parseErr) {
          // Invalid JSON, start with empty array
          logs = [];
        }
      } catch (readErr) {
        // File doesn't exist or can't be read
        logs = [];
      }
      
      // Add the new entry and safely write
      logs.push(entry);
      await fs.promises.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (err) {
      // Just log error without breaking request handling
      console.error('Failed to log page view', err);
    }
  }
  next();
}
