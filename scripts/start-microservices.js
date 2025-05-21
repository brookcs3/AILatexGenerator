import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  'content-service.js',
  'analytics-service.js',
  'seo-service.js'
];

for (const service of services) {
  const p = fork(path.join(__dirname, service));
  p.on('exit', code => {
    console.log(`${service} exited with code ${code}`);
  });
}
