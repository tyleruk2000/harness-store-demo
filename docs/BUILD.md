# Build & image internals

How the Docker images are built, and the one non-obvious decision that makes the
frontend image portable across environments.

## Images

Both images are multi-stage and run as **non-root** users.

### Backend (`backend/Dockerfile`, context = repo root)

| Stage     | Purpose                                                              |
| --------- | ------------------------------------------------------------------- |
| `base`    | `python:3.12-slim`, env flags, workdir                              |
| `deps`    | `pip install --prefix=/install -r requirements.txt`                |
| `runtime` | copies deps, app, and `database/seed.sql`; non-root `appuser`; entrypoint |
| `test`    | extends `runtime` with `requirements-dev.txt`; runs `pytest`        |

The build context is the **repo root** (not `backend/`) so the image can
`COPY database/seed.sql`. A root `.dockerignore` keeps the context lean.

**Entrypoint** (`backend/entrypoint.sh`): wait for Postgres → `alembic upgrade
head` → idempotent seed → `uvicorn`. Migrations and seeding are gated by
`RUN_MIGRATIONS_ON_START` / `SEED_ON_STARTUP` so they can be turned off (e.g. if
a one-shot job owns migrations in a clustered deployment).

### Frontend (`frontend/Dockerfile`, context = `frontend/`)

| Stage    | Purpose                                                            |
| -------- | ----------------------------------------------------------------- |
| `deps`   | `npm ci`                                                          |
| `build`  | `next build` with `output: "standalone"`                          |
| `runner` | copies `.next/standalone` + `.next/static` + `public/`; non-root `nextjs` |
| `test`   | runs Vitest                                                       |

`output: "standalone"` produces a self-contained `server.js` with only the
runtime dependencies — a small, fast image. The runner stage must copy
**three** things: the standalone server, `.next/static`, and `public/`
(forgetting the latter two ships missing CSS/images).

## The `NEXT_PUBLIC` build-time-baking gotcha

`NEXT_PUBLIC_*` environment variables are **inlined into the client JS bundle at
build time**. With a standalone image, whatever value was present during
`next build` is frozen into the image — you **cannot** change it at container
runtime. So a backend URL baked as `NEXT_PUBLIC_API_URL` would be wrong the
moment you run the same image somewhere else.

There are three ways to handle the browser → backend address:

1. **Bake an absolute URL** as a build arg — simple, but the image is tied to one
   environment and must be rebuilt to move it. ❌ not portable.
2. **Same-origin `/api` + a Next rewrite** — but rewrite _destinations_ are also
   baked into the routes manifest at build time, so the upstream still can't vary
   at runtime. ❌ same problem, one layer down.
3. **Same-origin `/api` + a runtime proxy route handler** — the browser calls a
   constant relative `/api/*`, and a Next.js route handler
   (`src/app/api/[...path]/route.ts`) forwards each request to
   `process.env.BACKEND_URL`, read **at request time**. ✅ **chosen.**

So:

- `NEXT_PUBLIC_API_BASE_URL=/api` is the **only** baked public value, and it's a
  constant in every environment — baking it is harmless.
- `BACKEND_URL` is a **server-side, runtime** variable (no `NEXT_PUBLIC_` prefix),
  so it never reaches the client bundle and can differ per environment.
- Server Components fetch the backend directly via `BACKEND_URL`; the browser
  goes through the same-origin proxy. One `src/lib/api.ts` picks the base by
  `typeof window`.

Net effect: **one image runs unchanged** in local dev, Docker Compose, and a
future Kubernetes cluster — only `BACKEND_URL` changes.

## Healthchecks

The slim images have no `curl`/`wget`, so healthchecks use interpreters that are
already present: Python `urllib` for the backend, `node -e http.get` for the
frontend (which exposes a tiny `/healthz` route).

## Where CI/CD would hook in

No pipeline is included, but it's a thin layer on top of what's here:

- **CI**: run the same three commands `scripts/test.sh` runs (they already have
  CI-ready exit codes and emit JUnit XML + coverage to `./.test-output`).
- **CD**: build the images, push them to a registry (replacing the local
  `:local` tags), and deploy. Add TLS at the edge for anything public.
