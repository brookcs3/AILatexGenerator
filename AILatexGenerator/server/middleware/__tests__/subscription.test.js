import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const requireTs = createRequire('/root/.nvm/versions/node/v22.15.1/lib/node_modules/typescript/lib/typescript.js');
const ts = requireTs('typescript');

function loadModule() {
  const src = fs.readFileSync(path.resolve('server/middleware/subscription.ts'), 'utf8');
  const matchFn = src.match(/export async function checkSubscription[\s\S]*?\n}/);
  const matchNext = src.match(/function getNextTier[\s\S]*?\n}/);
  if (!matchFn || !matchNext) throw new Error('functions not found');
  const func = matchFn[0].replace('export async function', 'async function');
  const nextTier = matchNext[0];
  const code = `
const SubscriptionTier = { Free: 'free', Basic: 'basic', Pro: 'pro', Power: 'power' };
const tierLimits = { [SubscriptionTier.Free]: 1, [SubscriptionTier.Basic]: 5, [SubscriptionTier.Pro]: 10, [SubscriptionTier.Power]: 20 };
let user = null;
const storage = { async getUserById() { return user; } };
function setUser(u) { user = u; }
${func}
${nextTier}
export { checkSubscription, tierLimits, SubscriptionTier, setUser };
`;
  const transpiled = ts.transpileModule(code, { compilerOptions: { module: 'ES2020', target: 'ES2020' } }).outputText;
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(transpiled).toString('base64');
  return import(moduleUrl);
}

const modPromise = loadModule();

test('allows registered user under limit', async () => {
  const { checkSubscription, setUser, tierLimits, SubscriptionTier } = await modPromise;
  setUser({ subscriptionTier: SubscriptionTier.Free, monthlyUsage: tierLimits[SubscriptionTier.Free] - 1 });
  const req = { session: { userId: 1 } };
  let called = false;
  await checkSubscription(req, {}, () => { called = true; });
  assert.ok(called);
});

test('blocks user over limit', async () => {
  const { checkSubscription, setUser, tierLimits, SubscriptionTier } = await modPromise;
  setUser({ subscriptionTier: SubscriptionTier.Free, monthlyUsage: tierLimits[SubscriptionTier.Free] });
  const req = { session: { userId: 1 } };
  let statusCode = null;
  const res = { status(code) { statusCode = code; return this; }, json() { return this; } };
  let called = false;
  await checkSubscription(req, res, () => { called = true; });
  assert.strictEqual(statusCode, 402);
  assert.strictEqual(called, false);
});

test('blocks anonymous user over limit', async () => {
  const { checkSubscription, tierLimits, SubscriptionTier } = await modPromise;
  const req = { session: { anonymousUsage: tierLimits[SubscriptionTier.Free] } };
  let statusCode = null;
  const res = { status(code) { statusCode = code; return this; }, json() { return this; } };
  let called = false;
  await checkSubscription(req, res, () => { called = true; });
  assert.strictEqual(statusCode, 402);
  assert.strictEqual(called, false);
});
