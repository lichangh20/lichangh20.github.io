# Visitor statistics Worker

Dependency-free Cloudflare Worker + D1 service for the personal website. The site remains hosted on GitHub Pages. No deployment or account creation is performed by these files.

## Current deployment

- Worker: `changhao-visitor-stats`
- Endpoint: https://changhao-visitor-stats.lichangh20.workers.dev
- Database: `changhao-visitors` (the existing account and database IDs are in `wrangler.jsonc`)
- Deployed on 2026-09-06. The homepage is configured to use this endpoint; local previews only read, while the published GitHub Pages site records visits.

For updates, reuse the existing database: run the tests, apply any new migrations, and deploy the Worker. Do not create another database or replace its UUID during routine updates. No paid plan or billing changes were made during setup.

## First-time setup in a new account

Requires a Cloudflare account and Wrangler CLI. Run from this directory. `npx wrangler` below downloads/runs Wrangler if it is not already installed; it is deployment tooling, not an application dependency.

1. Authenticate and inspect the selected account:

   ```sh
   npx wrangler login
   npx wrangler whoami
   ```

2. Create a dedicated database:

   ```sh
   npx wrangler d1 create changhao-visitors
   ```

   Only when intentionally setting up a new account/database, replace `account_id` and `d1_databases[0].database_id` in `wrangler.jsonc` with that account and the returned database UUID. Preserve the `DB` binding and `migrations_dir`. If Wrangler offers to write configuration automatically, inspect the resulting binding before proceeding.

3. Apply the create-only schema remotely:

   ```sh
   npx wrangler d1 migrations apply changhao-visitors --remote
   ```

   The migration is idempotent and does not reset existing counts. It creates only these service tables and an index.

4. Verify the implementation and deploy:

   ```sh
   node --test worker.test.mjs
   npx wrangler deploy
   ```

   Tests require Node 24+ for the built-in SQLite adapter; they do not use network access or a Cloudflare account. Use the returned Worker URL as the frontend analytics endpoint. If prompted to create a workers.dev subdomain, select the account subdomain first.

5. Check `https://<your-worker-host>/stats`. Initially expect zero totals and an empty points array. Wire frontend POSTs only for `window.location.origin === 'https://lichangh20.github.io'`. Local previews must only GET statistics, never send test hits to production. Frontend session deduplication is best-effort and must not be described as unique-visitor counting.

Optional isolated local Worker development (local D1 only):

```sh
npx wrangler d1 migrations apply changhao-visitors --local
npx wrangler dev
```

Local requests may not have real Cloudflare geolocation. Production `/hit` smoke tests increment real counters; prefer the offline test suite rather than fabricated production hits.

## API

- `POST /hit`: accepts only the exact configured production `Origin`; responds `{ "ok": true }`. No body is needed, and any body is ignored. Each accepted successful request increments visits. Only valid `request.cf.latitude` and `longitude` produce a location bucket.
- `GET /stats`: public read, returning `{ "totals": { "visits": 0, "places": 0 }, "points": [{ "label": "City, US", "lat": 37.8, "lon": -122.4, "count": 1 }] }` (example shape, not seeded data). Browser reads allow production origin and exactly `http://127.0.0.1:8765` / `http://localhost:8765`. No-Origin reads are allowed. Other browser origins are rejected.
- `OPTIONS`: allows only the route's actual method and optional Content-Type header for the permitted origins. No credentials/cookies are used.
- Invalid route/method/origin produces 404/405/403. Storage failures produce a generic 503 without SQL or internal details. Responses use `Cache-Control: no-store`, so unavailable or stale stats are not cached.

Totals are queried independently from the top 500 displayed points. `places` counts country + coordinates rounded to 0.1-degree buckets, not unique cities or people. Missing geolocation still increments visits. Writes are batched atomically; a failed location update rolls back its global increment.

## Privacy and operational limits

The application stores only aggregate visit counts, coarse coordinates, and bounded city/country labels from Cloudflare metadata. It does not read/store/log IP addresses, user agents, referrers, cookies, identifiers, request bodies, or exact coordinates. Worker observability is disabled in configuration; Cloudflare itself still processes request/network data under its own policies. Geolocation is approximate and affected by VPNs and network routing.

Origin checks constrain browsers, not determined clients: non-browser callers can forge Origin and inflate counts. This is a lightweight traffic display, not fraud-resistant analytics or unique-person tracking. No rate limiting or bot classification is claimed. D1/Workers account quotas and pricing apply; monitor usage in Cloudflare before exposing the endpoint. Public point summaries expose approximate traffic distribution. There is no historical data import or scheduled retention/deletion job. Counter data starts with this database, not prior third-party analytics.

## Usage and free quotas

A new production tab first writes a visit through `/hit`, then reads the aggregate counters and location points through `/stats`. Same-tab reloads normally only read; local previews only read. An accepted hit updates the global counter and, if geolocation is available, a location counter. A stats request performs three read queries. Requests, queries, rows read/written, and unique visitors are different units; one website visit does not correspond to one billable row. Index maintenance may add written rows. Storage grows mainly with new location buckets rather than with every visit.

In Cloudflare, open **D1 SQL database → changhao-visitors → Metrics** to inspect **Rows read**, **Rows written**, and **Storage**. The separate read/write query counts are not the billing row counts. Open the Worker under **Workers & Pages** for request and error metrics. See [D1 metrics](https://developers.cloudflare.com/d1/observability/metrics-analytics/) and [Workers metrics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/).

As of 2026-09-06, the [Workers Free plan](https://developers.cloudflare.com/workers/platform/pricing/) includes 100,000 requests/day. [D1 Free](https://developers.cloudflare.com/d1/platform/pricing/) includes 5 million rows read/day, 100,000 rows written/day, and 5 GB total account storage; per-database limits also apply. Free-tier D1 usage limits block further affected queries/storage rather than automatically upgrading the account. Check current pricing and actual account usage before changing plans.

Official references: [D1 setup](https://developers.cloudflare.com/d1/get-started/), [prepared statements and atomic batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Cloudflare request metadata](https://developers.cloudflare.com/workers/runtime-apis/request/).
