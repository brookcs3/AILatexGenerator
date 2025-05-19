import fs from 'fs';

export function config() {
  const envFile = fs.existsSync('.env') ? '.env' : '.env.example';
  if (fs.existsSync(envFile)) {
    const envData = fs.readFileSync(envFile, 'utf8');
    for (const line of envData.split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match) {
        let [, key, value] = match;
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
  return { parsed: process.env };
}
