#!/usr/bin/env sh
# Backend container entrypoint: make `docker compose up` work from scratch.
#   1. wait for Postgres to accept connections
#   2. run Alembic migrations (toggle with RUN_MIGRATIONS_ON_START)
#   3. seed the catalog idempotently (toggle with SEED_ON_STARTUP)
#   4. exec the CMD (uvicorn)
set -eu

echo "[entrypoint] waiting for database..."
python -m app.db.wait_for_db

if [ "${RUN_MIGRATIONS_ON_START:-true}" = "true" ]; then
  echo "[entrypoint] running migrations..."
  alembic upgrade head
fi

if [ "${SEED_ON_STARTUP:-true}" = "true" ]; then
  echo "[entrypoint] seeding (only if empty)..."
  python -m app.db.seed
fi

echo "[entrypoint] starting: $*"
exec "$@"
