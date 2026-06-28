# 🧗 Crux

A polished, full-stack **demo climbing-gear store** — harnesses, helmets, ropes
and carabiners for imaginary adventures. Built to look and behave like a real
product (not a toy), and to run from scratch with a single command.

> _Gear up for your next send. Demo checkout. Real Kubernetes energy._

It's a complete **3-tier application**:

| Tier      | Stack                                             |
| --------- | ------------------------------------------------- |
| Frontend  | Next.js (App Router) · TypeScript · Tailwind CSS  |
| Backend   | FastAPI · SQLAlchemy 2.0 · Pydantic v2 · Alembic  |
| Database  | PostgreSQL 16                                      |
| Packaging | Docker · Docker Compose                           |

---

## Architecture

Request flow (the browser only ever talks to its own origin; the Next.js server
proxies `/api/*` to the backend, so there's no CORS and no backend URL baked
into the client bundle):

```
        User (browser)
            |
            v
   Frontend: Next.js  :3000
   ├─ pages (SSR/RSC) ──────────────┐  server-side fetch (BACKEND_URL)
   └─ /api/* proxy route handler ───┤
            |                       v
            +────────────> Backend API: FastAPI  :8000
                                    |
                                    v
                           Database: PostgreSQL  :5432
```

The condensed three-tier view:

```
User  →  Frontend (Next.js)  →  Backend API (FastAPI)  →  Database (PostgreSQL)
```

---

## Prerequisites

- **Docker** 23+ and **Docker Compose** v2
- (optional, for local dev outside Docker) **Node** 20+ and **Python** 3.12+

---

## Quick start (Docker Compose)

```bash
cp .env.example .env          # sensible defaults that work out of the box
docker compose up --build     # builds + starts postgres, backend, frontend
```

The backend automatically waits for Postgres, runs migrations, and seeds the
catalogue on first start. Once everything is healthy:

| Service       | URL                              |
| ------------- | -------------------------------- |
| 🛍  Storefront | http://localhost:3000            |
| ⚙️  Backend API | http://localhost:8000            |
| 📘 API docs (Swagger) | http://localhost:8000/docs  |
| ❤️  Health check | http://localhost:8000/health    |

Stop it with `Ctrl-C`, or `docker compose down` (add `-v` to wipe the database).

> **Port already in use?** If `3000`, `8000`, or `5432` are taken on your
> machine, set `FRONTEND_PORT`, `BACKEND_PORT`, or `POSTGRES_PORT` in `.env` to
> free ports and re-run. See [Troubleshooting](#troubleshooting).

---

## Running the tests (in Docker)

The **entire** test suite runs in Docker against throwaway, ephemeral databases —
no local Node/Python/Postgres needed:

```bash
./scripts/test.sh        # or: make test
```

This runs three layers and exits non-zero if any fails (CI-ready):

1. **Backend** — `pytest` with coverage (≥85% enforced) against an ephemeral Postgres
2. **Frontend** — Vitest unit/component tests (React Testing Library + MSW)
3. **End-to-end** — Playwright vs a throwaway, fully-seeded stack (incl. axe a11y)

Reports are written to `./.test-output/` (`backend-cov/index.html`,
`backend-junit.xml`, `playwright-report/index.html`). Run a single layer with
`make test-backend`, `make test-frontend`, or `make test-e2e`.

See **[docs/TESTING.md](docs/TESTING.md)** for the full testing guide.

---

## Environment variables

Defined in `.env` (copy from `.env.example`). `make` / Compose substitute these.

| Variable                  | Consumer | Build/Runtime | Secret | Default                          | Notes |
| ------------------------- | -------- | ------------- | ------ | -------------------------------- | ----- |
| `POSTGRES_USER`           | postgres | runtime       | no     | `crux`                     | |
| `POSTGRES_PASSWORD`       | postgres | runtime       | yes    | `change_me_local_dev`            | change for anything shared |
| `POSTGRES_DB`             | postgres | runtime       | no     | `crux`                     | |
| `POSTGRES_PORT`           | host     | runtime       | no     | `5432`                           | host port mapping |
| `DATABASE_URL`            | backend  | runtime       | yes    | `postgresql+psycopg://…`         | psycopg v3 driver |
| `ADMIN_PASSCODE`          | backend  | runtime       | yes    | `belay-on`                       | guards admin write endpoints |
| `CORS_ORIGINS`            | backend  | runtime       | no     | `http://localhost:3000`          | comma-separated |
| `RUN_MIGRATIONS_ON_START` | backend  | runtime       | no     | `true`                           | runs `alembic upgrade head` |
| `SEED_ON_STARTUP`         | backend  | runtime       | no     | `true`                           | idempotent catalogue seed |
| `BACKEND_PORT`            | host     | runtime       | no     | `8000`                           | host port mapping |
| `BACKEND_URL`             | frontend | **runtime**   | no     | `http://backend:8000`            | server-side proxy target |
| `NEXT_PUBLIC_API_BASE_URL`| frontend | **build**     | no     | `/api`                           | constant, baked at build |
| `FRONTEND_PORT`           | host     | runtime       | no     | `3000`                           | host port mapping |

---

## Demo admin

There's a lightweight admin area at **http://localhost:3000/admin**.

- Default passcode: **`belay-on`** (set via `ADMIN_PASSCODE`).
- It's a single shared demo secret, **not real authentication** — write
  endpoints simply require the `X-Admin-Passcode` header. Reads are open.

From admin you can add products, see live stock levels, and toggle which
products are "crew picks" (featured).

---

## Demo flow

A scripted walk-through that exercises the whole app:

1. Open the **homepage** → hero, category tiles, featured "crew picks".
2. **Browse** harnesses (`/products?category=harnesses`).
3. Open a **product detail** page (specs, stock, related gear).
4. **Add to basket** ("Add to rack"); the cart badge bumps.
5. Add a **helmet or carabiner** from another category.
6. Open the **basket** → adjust quantities, see subtotal + shipping + total.
7. **Checkout** (`/checkout`) → fill the form, "Send order".
8. See the **order confirmation** with its `CRX-…` number.
9. **Order history** (`/orders`) → search by the email you used.
10. Open **admin** (`/admin`) → enter `belay-on`.
11. **Add a new product** with all key fields.
12. Confirm it **appears in the catalogue** (search for it on `/products`).
13. Show the backend **`/health`** endpoint.
14. Show the interactive **`/docs`** (Swagger UI).

---

## Project structure

```
crux/
├── docker-compose.yml         # postgres + backend + frontend
├── docker-compose.test.yml    # full test suite (pytest + vitest + playwright)
├── .env.example  Makefile  scripts/test.sh
├── docs/                      # BUILD.md, TESTING.md
├── database/                  # init.sql (extensions), seed.sql (derived snapshot)
├── backend/                   # FastAPI app, models, services, Alembic, tests
│   └── app/{api,core,db,models,schemas,services,tests}
└── frontend/                  # Next.js app
    └── src/{app,components,lib,types,test}  +  e2e/
```

---

## Local development (without Docker)

**Backend:**

```bash
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
export DATABASE_URL=postgresql+psycopg://crux:crux@localhost:5432/crux
alembic upgrade head && python -m app.db.seed
uvicorn app.main:app --reload          # http://localhost:8000
pytest                                  # run the backend tests
```

**Frontend:**

```bash
cd frontend
npm install
BACKEND_URL=http://localhost:8000 npm run dev   # http://localhost:3000
npm run test                                     # Vitest
```

---

## Troubleshooting

- **`port is already allocated`** — another process (often a local Postgres on
  `5432`, or a dev server on `3000`) holds the port. Set `POSTGRES_PORT`,
  `BACKEND_PORT`, and/or `FRONTEND_PORT` in `.env` to free ports, then re-run.
- **Backend unhealthy / can't connect to DB** — Postgres may still be starting.
  The backend retries for ~60s; check `docker compose logs backend`.
- **Frontend shows "Upstream backend unreachable"** — confirm `BACKEND_URL`
  points at the backend service (`http://backend:8000` in Compose).
- **Reset everything** — `docker compose down -v` removes the database volume so
  the next `up` re-seeds from scratch.

---

## Cleanup

```bash
docker compose down -v                              # app stack + database volume
docker compose -f docker-compose.test.yml down -v   # any leftover test containers
```

---

## Beyond this demo

- **Kubernetes** — out of scope here, but the app is K8s-ready: liveness
  (`/health`) and readiness (`/ready`) probes, non-root images, same-origin
  `/api` proxy, and fully env-driven config. Manifests can be added as a
  follow-up without code changes.
- **CI/CD** — not built, but wiring it up is one step: a CI job calls the same
  `docker compose -f docker-compose.test.yml …` commands that `scripts/test.sh`
  runs. For deploys you'd push the images to a registry (replacing the local
  `:local` tags) and add TLS at the edge. See
  **[docs/BUILD.md](docs/BUILD.md)** and **[docs/TESTING.md](docs/TESTING.md)**.

_Crux is a demo. No real gear, no real money, no real climbers were
left hanging._
