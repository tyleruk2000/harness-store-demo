"""Engine, session factory, and the FastAPI DB dependency."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# pool_pre_ping recycles dead connections (e.g. Postgres restarted under us).
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, future=True, expire_on_commit=False
)


def get_db() -> Generator[Session, None, None]:
    """Yield a request-scoped session, always closed afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
