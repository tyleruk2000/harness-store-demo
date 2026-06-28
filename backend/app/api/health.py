"""Health (liveness) and readiness endpoints.

Distinction matters for orchestration:
  * /health  → liveness. ALWAYS 200 while the process is up; reports DB status in
    the body but never fails, so a transient DB blip doesn't trigger restarts.
  * /ready   → readiness. Returns 503 when the DB is unreachable, so a load
    balancer / k8s pulls the instance out of rotation until the DB is back.
"""

from __future__ import annotations

from fastapi import APIRouter, Response, status
from sqlalchemy import text

from app.api.deps import DbSession
from app.schemas.common import HealthResponse, ReadyResponse

router = APIRouter(tags=["system"])


def _db_connected(db: DbSession) -> bool:
    try:
        db.execute(text("SELECT 1"))
        return True
    except Exception:  # noqa: BLE001 - any failure means "not connected"
        return False


@router.get("/health", response_model=HealthResponse)
def health(db: DbSession) -> HealthResponse:
    connected = _db_connected(db)
    return HealthResponse(
        status="ok",
        service="backend",
        database="connected" if connected else "disconnected",
    )


@router.get("/ready", response_model=ReadyResponse)
def ready(db: DbSession, response: Response) -> ReadyResponse:
    if _db_connected(db):
        return ReadyResponse(status="ready", service="backend", database="connected")
    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return ReadyResponse(status="not ready", service="backend", database="disconnected")
