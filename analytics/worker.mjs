const PREVIEW_ORIGINS = new Set(['http://127.0.0.1:8765', 'http://localhost:8765']);
const POINT_LIMIT = 500;

function response(data, status, origin, extra = {}) {
  return new Response(data === null ? null : JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Origin',
      ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
      ...extra,
    },
  });
}

function coordinate(value, limit) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? Math.round(number * 10) / 10 : null;
}

function location(cf) {
  const lat = coordinate(cf?.latitude, 90);
  const lon = coordinate(cf?.longitude, 180);
  if (lat === null || lon === null) return null;
  const country = typeof cf?.country === 'string' && /^[A-Z]{2}$/.test(cf.country) ? cf.country : 'XX';
  const city = typeof cf?.city === 'string' ? cf.city.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80) : '';
  return { key: `${country}:${lat.toFixed(1)}:${lon.toFixed(1)}`, lat, lon, label: city ? `${city}, ${country}` : country };
}

function count(value) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid aggregate');
  return number;
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const origin = request.headers.get('Origin');
    const production = typeof env.SITE_ORIGIN === 'string' && origin === env.SITE_ORIGIN && origin !== '';
    const readable = production || PREVIEW_ORIGINS.has(origin);
    const corsOrigin = readable ? origin : null;
    if (path !== '/hit' && path !== '/stats') return response({ error: 'Not found' }, 404, corsOrigin);
    const method = path === '/hit' ? 'POST' : 'GET';
    if (request.method === 'OPTIONS') {
      const permitted = path === '/hit' ? production : readable;
      const requestedMethod = request.headers.get('Access-Control-Request-Method');
      const requestedHeaders = (request.headers.get('Access-Control-Request-Headers') || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
      if (!permitted || requestedMethod !== method || requestedHeaders.some(header => header !== 'content-type')) {
        return response({ error: 'Forbidden' }, 403, null);
      }
      return response(null, 204, origin, {
        'Access-Control-Allow-Methods': method,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
      });
    }
    if (request.method !== method) return response({ error: 'Method not allowed' }, 405, corsOrigin, { Allow: `${method}, OPTIONS` });
    if (path === '/hit' && !production) return response({ error: 'Forbidden' }, 403, null);
    if (path === '/stats' && origin && !readable) return response({ error: 'Forbidden' }, 403, null);
    try {
      if (path === '/hit') {
        // Only Cloudflare's request metadata is used; the body is never read.
        const point = location(request.cf);
        const statements = [env.DB.prepare('UPDATE visitor_totals SET visits = visits + 1 WHERE id = 1')];
        if (point) statements.push(env.DB.prepare(
          'INSERT INTO visitor_places (bucket, label, lat, lon, visits) VALUES (?, ?, ?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET visits = visits + 1'
        ).bind(point.key, point.label, point.lat, point.lon));
        await env.DB.batch(statements);
        return response({ ok: true }, 200, corsOrigin);
      }
      const [totals, places, points] = await env.DB.batch([
        env.DB.prepare('SELECT visits FROM visitor_totals WHERE id = 1'),
        env.DB.prepare('SELECT COUNT(*) AS places FROM visitor_places'),
        env.DB.prepare('SELECT label, lat, lon, visits AS count FROM visitor_places ORDER BY visits DESC, bucket ASC LIMIT ?').bind(POINT_LIMIT),
      ]);
      return response({
        totals: { visits: count(totals.results[0].visits), places: count(places.results[0].places) },
        points: points.results.map(point => ({ label: point.label, lat: point.lat, lon: point.lon, count: count(point.count) })),
      }, 200, corsOrigin);
    } catch {
      return response({ error: 'Visitor statistics temporarily unavailable' }, 503, corsOrigin);
    }
  },
};
