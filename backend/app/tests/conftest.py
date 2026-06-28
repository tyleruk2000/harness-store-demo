"""Pytest fixtures.

Test DB strategy:
  * ``TEST_DATABASE_URL`` (or ``DATABASE_URL``) selects the backend. The Docker
    test service points it at a throwaway Postgres — the canonical path, because
    the concurrency test relies on ``SELECT ... FOR UPDATE``.
  * With no URL set, falls back to a file-backed SQLite DB so the logic subset
    runs anywhere. Tests marked ``@pytest.mark.postgres`` are skipped on SQLite.

Isolation:
  * ``db_session`` runs each test inside an outer transaction that is rolled back
    afterwards. ``join_transaction_mode="create_savepoint"`` turns the service's
    real ``commit()`` into a SAVEPOINT release, so committed rows never leak
    between tests while still exercising the real commit path.
"""

from __future__ import annotations

import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    os.environ.get("DATABASE_URL", "sqlite+pysqlite:///./_test_crux.db"),
)


def _is_postgres(url: str) -> bool:
    return url.startswith("postgresql")


def _enable_sqlite_savepoints(engine: Engine) -> None:
    """pysqlite's emulated transactions break SAVEPOINT-based test isolation.
    This is SQLAlchemy's documented recipe: disable the driver's auto-BEGIN and
    emit our own, so nested SAVEPOINTs and outer rollback behave like Postgres."""

    @event.listens_for(engine, "connect")
    def _on_connect(dbapi_conn, _record):  # type: ignore[no-untyped-def]
        dbapi_conn.isolation_level = None

    @event.listens_for(engine, "begin")
    def _on_begin(conn):  # type: ignore[no-untyped-def]
        conn.exec_driver_sql("BEGIN")


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    connect_args = {} if _is_postgres(TEST_DATABASE_URL) else {"check_same_thread": False}
    eng = create_engine(TEST_DATABASE_URL, connect_args=connect_args)
    if not _is_postgres(TEST_DATABASE_URL):
        _enable_sqlite_savepoints(eng)
    Base.metadata.drop_all(eng)
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)
    eng.dispose()


@pytest.fixture(autouse=True)
def _skip_postgres_only(request: pytest.FixtureRequest) -> None:
    if request.node.get_closest_marker("postgres") and not _is_postgres(TEST_DATABASE_URL):
        pytest.skip("requires a PostgreSQL backend (set TEST_DATABASE_URL)")


@pytest.fixture
def db_session(engine: Engine) -> Iterator[Session]:
    connection = engine.connect()
    outer = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        if outer.is_active:
            outer.rollback()
        connection.close()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers() -> dict[str, str]:
    return {"X-Admin-Passcode": settings.ADMIN_PASSCODE}
