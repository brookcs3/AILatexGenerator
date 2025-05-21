import fs from 'fs';
import path from 'path';

export function config(options = {}) {
  const envFile = options.path || path.resolve(process.cwd(), '.env');
  let data = '';
  try {
    data = fs.readFileSync(envFile, 'utf8');
  } catch (err) {
    try {
      data = fs.readFileSync(path.resolve(process.cwd(), '.env.example'), 'utf8');
    } catch {
      return {};
    }
  }
  const lines = data.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    const value = vals.join('=');
    if (key && !Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
  return { parsed: process.env };
}
