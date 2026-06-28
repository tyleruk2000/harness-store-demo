"""Block until Postgres accepts connections, then exit.

Used by the container entrypoint before running migrations. ``depends_on:
service_healthy`` in compose already gates startup, but this retry loop is a
belt-and-braces guard (and makes local non-compose runs forgiving).
"""

from __future__ import annotations

import sys
import time

from sqlalchemy import create_engine, text

from app.core.config import settings


def wait_for_db(max_seconds: int = 60, interval: float = 1.5) -> None:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    deadline = time.monotonic() + max_seconds
    attempt = 0
    while True:
        attempt += 1
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"Database is ready (after {attempt} attempt(s)).")
            engine.dispose()
            return
        except Exception as exc:  # noqa: BLE001 - any connection error means "not ready yet"
            if time.monotonic() >= deadline:
                print(f"Database not ready after {max_seconds}s: {exc}", file=sys.stderr)
                engine.dispose()
                sys.exit(1)
            print(f"Waiting for database (attempt {attempt})...")
            time.sleep(interval)


if __name__ == "__main__":
    wait_for_db()
