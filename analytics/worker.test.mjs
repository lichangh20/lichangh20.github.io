import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from './worker.mjs';

const SITE_ORIGIN = 'https://lichangh20.github.io';
const schema = readFileSync(new URL('./migrations/0001_visitors.sql', import.meta.url), 'utf8');
function fixture(t) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(schema);
  t.after(() => sqlite.close());
  const env = { SITE_ORIGIN, DB: {
    prepare(sql) { return { sql, values: [], bind(...values) { return { sql, values }; } }; },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const result = statements.map(({ sql, values }) => ({ success: true, results: sqlite.prepare(sql).all(...values) }));
        sqlite.exec('COMMIT');
        return result;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  } };
  async function call(path = '/stats', { method = 'GET', origin = SITE_ORIGIN, cf, body, headers = {} } = {}) {
    const request = new Request(`https://stats.example${path}`, {
      method, headers: { ...(origin === null ? {} : { Origin: origin }), ...headers }, body,
    });
    Object.defineProperty(request, 'cf', { value: cf });
    return worker.fetch(request, env);
  }
  return { sqlite, env, call, hit: options => call('/hit', { method: 'POST', ...options }) };
}

test('production hits and public/local read-only CORS', async t => {
  const { call, hit } = fixture(t);
  for (const origin of [null, 'null', 'https://evil.example', `${SITE_ORIGIN}.evil.example`, 'http://127.0.0.1:8765', 'http://localhost:8765']) {
    assert.equal((await hit({ origin })).status, 403);
  }
  assert.equal((await hit()).status, 200);
  for (const origin of [SITE_ORIGIN, 'http://127.0.0.1:8765', 'http://localhost:8765', null]) {
    const res = await call('/stats', { origin });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), origin);
    assert.equal(res.headers.get('Access-Control-Allow-Credentials'), null);
    assert.equal(res.headers.get('Cache-Control'), 'no-store');
  }
  assert.equal((await call('/stats', { origin: 'https://evil.example' })).status, 403);
  assert.deepEqual((await (await call()).json()).totals, { visits: 1, places: 0 });
});

test('route, methods, preflight method and header restrictions', async t => {
  const { call } = fixture(t);
  assert.equal((await call('/unknown')).status, 404);
  for (const [path, method] of [['/hit', 'GET'], ['/stats', 'POST'], ['/stats', 'HEAD']]) {
    const res = await call(path, { method });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get('Allow'), path === '/hit' ? 'POST, OPTIONS' : 'GET, OPTIONS');
  }
  for (const [path, requested, origin, status] of [
    ['/hit', 'POST', SITE_ORIGIN, 204], ['/hit', 'GET', SITE_ORIGIN, 403],
    ['/hit', 'POST', 'http://localhost:8765', 403], ['/stats', 'GET', 'http://localhost:8765', 204],
    ['/stats', 'POST', SITE_ORIGIN, 403], ['/stats', 'GET', null, 403],
  ]) {
    const res = await call(path, { method: 'OPTIONS', origin, headers: { 'Access-Control-Request-Method': requested, 'Access-Control-Request-Headers': 'content-type' } });
    assert.equal(res.status, status);
    if (status === 204) assert.equal(res.headers.get('Access-Control-Allow-Methods'), requested);
  }
  assert.equal((await call('/hit', { method: 'OPTIONS', headers: { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization' } })).status, 403);
});

test('coarse Cloudflare location and body spoofing protection', async t => {
  const { hit, call, sqlite } = fixture(t);
  const cf = { latitude: '37.7749', longitude: '-122.4194', city: 'San Francisco', country: 'US' };
  await hit({ cf, body: JSON.stringify({ latitude: 0, longitude: 0, visits: 9999, city: 'Fake' }) });
  await hit({ cf: { ...cf, latitude: 37.78, longitude: -122.42 } });
  await hit({ body: '{invalid JSON never parsed' });
  const stats = await (await call()).json();
  assert.deepEqual(stats, { totals: { visits: 3, places: 1 }, points: [{ label: 'San Francisco, US', lat: 37.8, lon: -122.4, count: 2 }] });
  assert.deepEqual(Object.keys(sqlite.prepare('SELECT * FROM visitor_places').get()), ['bucket', 'label', 'lat', 'lon', 'visits']);
});

test('invalid or absent geo still counts; zero coordinates valid; labels bounded', async t => {
  const { hit, call } = fixture(t);
  for (const latitude of [undefined, null, '', ' ', Infinity, 'NaN', 91, -91, false, {}]) {
    await hit({ cf: { latitude, longitude: 10 } });
  }
  await hit({ cf: { latitude: 1, longitude: 181 } });
  await hit({ cf: { latitude: 0, longitude: '0', country: 'US', city: '\u0000' + 'a'.repeat(200) } });
  await hit({ cf: { latitude: 0, longitude: '0', country: 'GB' } });
  const stats = await (await call()).json();
  assert.deepEqual(stats.totals, { visits: 13, places: 2 });
  assert.ok(stats.points.every(point => point.lat === 0 && point.lon === 0 && point.label.length <= 84));
});

test('totals independent of top 500 points and migration preserves data', async t => {
  const { sqlite, call } = fixture(t);
  const insert = sqlite.prepare('INSERT INTO visitor_places VALUES (?, ?, ?, ?, ?)');
  for (let i = 0; i < 503; i++) insert.run(`US:${i}`, 'City, US', 10, 20, i + 1);
  sqlite.prepare('UPDATE visitor_totals SET visits = ?').run(126756);
  sqlite.exec(schema);
  const stats = await (await call()).json();
  assert.equal(stats.points.length, 500);
  assert.deepEqual(stats.totals, { visits: 126756, places: 503 });
  assert.equal(stats.points[0].count, 503);
});

test('transaction rollback and sanitized unavailable responses', async t => {
  const { sqlite, hit, call } = fixture(t);
  sqlite.exec("CREATE TRIGGER reject_location BEFORE INSERT ON visitor_places BEGIN SELECT RAISE(ABORT, 'secret SQL details'); END");
  const failed = await hit({ cf: { latitude: 1, longitude: 2 } });
  assert.equal(failed.status, 503);
  assert.deepEqual(await failed.json(), { error: 'Visitor statistics temporarily unavailable' });
  assert.equal((await (await call()).json()).totals.visits, 0);
  sqlite.exec('DROP TABLE visitor_totals');
  assert.equal((await call()).status, 503);
});

test('unavailable binding and unsafe aggregate do not expose details or nonfinite counts', async t => {
  const { env, call, sqlite } = fixture(t);
  sqlite.prepare('UPDATE visitor_totals SET visits = ?').run(1e30);
  assert.equal((await call()).status, 503);
  delete env.DB;
  assert.equal((await call()).status, 503);
});
