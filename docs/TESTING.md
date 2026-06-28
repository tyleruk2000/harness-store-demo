# Testing guide

Everything runs in Docker so you need nothing installed locally but Docker.

```bash
./scripts/test.sh        # the whole suite (or: make test)
```

It runs three layers and **fails fast** with a non-zero exit code if any layer
fails. Reports land in `./.test-output/`.

## The three layers

### 1. Backend — pytest (`backend/app/tests/`)

Runs against an **ephemeral Postgres** (`tmpfs`, thrown away after). Coverage is
enforced at **≥85%** (currently ~97%).

What's covered:

- **Order service** (the correctness-critical code): happy path, totals math,
  insufficient stock → `409`, unknown product → `422`, exact-stock boundary,
  duplicate line aggregation, transaction rollback/atomicity, and a real
  **concurrency** test (two threads race for the last unit via `SELECT … FOR
  UPDATE` — exactly one wins, stock never goes negative).
- **Product & order APIs**: filtering, featured, categories, validation errors,
  status codes, server-side totals (a client-sent price is ignored).
- **Admin guard**: missing / empty / wrong / correct passcode; `/admin/verify`.
- **Health vs readiness**: `/health` stays `200` when the DB is down (liveness);
  `/ready` returns `503` (readiness).
- **Seed & migrations**: idempotent seeding, `alembic upgrade/downgrade`, schema
  matches the ORM metadata.

Test isolation uses a SQLAlchemy savepoint per test (`join_transaction_mode =
"create_savepoint"`) rolled back afterwards, so the service's real `commit()`
never leaks between tests.

Run just this layer: `make test-backend`.

### 2. Frontend — Vitest (`frontend/src/**/*.test.tsx`)

jsdom + React Testing Library, with the network mocked by **MSW**. Covers the
cart reducer & localStorage hydration, the typed API client (base resolution,
admin header, `ApiError`, query building), form validation (zod), and key
components (Button, QuantitySelector, StockBadge, CartSummary, ProductCard).
Coverage of `src/lib` is reported (~88%).

Run just this layer: `make test-frontend`. Locally: `cd frontend && npm run test`.

### 3. End-to-end — Playwright (`frontend/e2e/`)

Runs against a **throwaway, fully-seeded stack** (its own Postgres + backend +
frontend) using the official Playwright image (browsers preinstalled). Covers
the whole demo journey:

- `shop.spec.ts` — browse → product → add to cart → checkout → confirmation
  number → cart cleared → order history; plus checkout validation.
- `admin.spec.ts` — passcode gate (reject wrong, accept right) → add a product →
  it appears in the catalogue.
- `a11y.spec.ts` — axe scans (no serious/critical WCAG 2 AA violations) on home,
  products, product detail, and cart, plus a keyboard-navigation check.

Run just this layer: `make test-e2e`.

## Reports

After a run, open:

- `./.test-output/backend-cov/index.html` — backend coverage
- `./.test-output/backend-junit.xml` — backend JUnit (for CI)
- `./.test-output/playwright-report/index.html` — E2E report (with traces on retry)

## Running E2E locally against a live stack

```bash
docker compose up --build -d          # bring up the app
cd frontend
npx playwright install chromium       # one-time
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

## Debugging tips

- A failing E2E? Re-run with `--headed` or open the HTML report's trace viewer.
- Backend test DB issues? The canonical run is Postgres; a quick local subset can
  run on SQLite (`cd backend && pytest`), where the concurrency test auto-skips.
- Stuck containers? `docker compose -f docker-compose.test.yml down -v`.
