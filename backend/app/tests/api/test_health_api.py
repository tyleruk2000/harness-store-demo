"""Health + readiness endpoints."""

from __future__ import annotations

import pytest
from sqlalchemy.exc import OperationalError

from app.db.session import get_db
from app.main import app


def test_health_exact_body(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "service": "backend", "database": "connected"}


def test_ready_ok(client):
    res = client.get("/ready")
    assert res.status_code == 200
    assert res.json()["database"] == "connected"


class _BrokenSession:
    """Stand-in DB session whose execute() always fails."""

    def execute(self, *_args, **_kwargs):
        raise OperationalError("SELECT 1", {}, Exception("db down"))


@pytest.fixture
def broken_db_client(client):
    app.dependency_overrides[get_db] = lambda: _BrokenSession()
    yield client
    # restore the working override installed by the `client` fixture's teardown
    app.dependency_overrides.pop(get_db, None)


def test_health_stays_200_when_db_down(broken_db_client):
    # Liveness must not flap on a DB blip.
    res = broken_db_client.get("/health")
    assert res.status_code == 200
    assert res.json()["database"] == "disconnected"


def test_ready_503_when_db_down(broken_db_client):
    res = broken_db_client.get("/ready")
    assert res.status_code == 503
    assert res.json()["status"] == "not ready"
