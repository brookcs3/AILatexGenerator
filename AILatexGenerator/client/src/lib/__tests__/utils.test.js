import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const requireTs = createRequire('/root/.nvm/versions/node/v22.15.1/lib/node_modules/typescript/lib/typescript.js');
const ts = requireTs('typescript');

function loadUtils() {
  const src = fs.readFileSync(path.resolve('client/src/lib/utils.ts'), 'utf8');

  function extract(name) {
    const start = src.indexOf(`export function ${name}`);
    if (start === -1) return '';
    let i = src.indexOf('{', start);
    if (i === -1) return '';
    let brace = 1;
    i++;
    while (i < src.length && brace > 0) {
      if (src[i] === '{') brace++;
      else if (src[i] === '}') brace--;
      i++;
    }
    return src.slice(start, i);
  }

  const readable = extract('getReadableFilename');
  const usage = extract('getUsageColor');
  const code = `${readable}\n${usage}\nexport { getReadableFilename, getUsageColor };`;
  const transpiled = ts.transpileModule(code, { compilerOptions: { module: 'ES2020', target: 'ES2020' } }).outputText;
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(transpiled).toString('base64');
  return import(moduleUrl);
}

const utilsPromise = loadUtils();

describe('getReadableFilename', () => {
  it('converts title to PascalCase', async () => {
    const { getReadableFilename } = await utilsPromise;
    const result = getReadableFilename('My test document!');
    assert.strictEqual(result, 'MyTestDocument');
  });

  it('falls back to default when title is empty', async () => {
    const { getReadableFilename } = await utilsPromise;
    const result = getReadableFilename('   ');
    assert.strictEqual(result, 'GeneratedDocument');
  });
});

describe('getUsageColor', () => {
  it('returns red when usage >= 90%', async () => {
    const { getUsageColor } = await utilsPromise;
    assert.strictEqual(getUsageColor(95, 100), 'text-red-600');
  });

  it('returns amber when usage >= 70%', async () => {
    const { getUsageColor } = await utilsPromise;
    assert.strictEqual(getUsageColor(75, 100), 'text-amber-600');
  });

  it('returns emerald for lower usage', async () => {
    const { getUsageColor } = await utilsPromise;
    assert.strictEqual(getUsageColor(30, 100), 'text-emerald-600');
  });
});
