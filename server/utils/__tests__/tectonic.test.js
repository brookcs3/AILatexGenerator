import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

let ts;
try {
  const requireTs = createRequire(import.meta.url);
  ts = requireTs('typescript');
} catch {
  console.log('# typescript not installed - skipping tests');
}

function loadParseErrorLog() {
  const src = fs.readFileSync(path.resolve('server/utils/tectonic.ts'), 'utf8');
  const match = src.match(/function parseErrorLog[\s\S]*?return errors;\n}/);
  if (!match) throw new Error('parseErrorLog not found');
  const transpiled = ts.transpileModule(match[0] + '\nexport { parseErrorLog };', {
    compilerOptions: { module: 'ES2020', target: 'ES2020' }
  }).outputText;
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(transpiled).toString('base64');
  return import(moduleUrl).then(mod => mod.parseErrorLog);
}

if (!ts) {
  test('typescript missing', { skip: true }, () => {});
} else {
  const parseErrorLogPromise = loadParseErrorLog();

  test('parses single error with message on next line', async () => {
    const parseErrorLog = await parseErrorLogPromise;
    const log = 'l.5 \\usepackage{foo}\nUndefined control sequence';
    assert.deepStrictEqual(parseErrorLog(log), [
      { line: 5, message: 'l.5 \\usepackage{foo} Undefined control sequence' }
    ]);
  });

  test('parses multiple errors', async () => {
    const parseErrorLog = await parseErrorLogPromise;
    const log =
      'l.5 \\usepackage{foo}\nUndefined control sequence\n' +
      'Some text\n' +
      'l.8 \\begin{equation}\nMissing $ inserted';
    assert.deepStrictEqual(parseErrorLog(log), [
      { line: 5, message: 'l.5 \\usepackage{foo} Undefined control sequence' },
      { line: 8, message: 'l.8 \\begin{equation} Missing $ inserted' }
    ]);
  });

  test('returns message line when next line not recognized', async () => {
    const parseErrorLog = await parseErrorLogPromise;
    const log = 'l.10 some code here\nnot an error';
    assert.deepStrictEqual(parseErrorLog(log), [
      { line: 10, message: 'l.10 some code here' }
    ]);
  });
}
