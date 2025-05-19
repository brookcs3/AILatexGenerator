import { readFileSync } from 'fs';
import { resolve } from 'path';

export function config(options = {}) {
  const envPath = resolve(options.path || '.env');
  try {
    const data = readFileSync(envPath, 'utf8');
    for (const line of data.split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
      if (match) {
        const [, key, value] = match;
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    }
    return { parsed: process.env };
  } catch {
    return {};
  }
}
