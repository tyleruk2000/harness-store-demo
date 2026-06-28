"""Declarative base.

Deliberately defines ``Base`` ONLY and imports no models, so importing it can
never create a circular import. ``app.models`` is the single place that imports
every model to complete ``Base.metadata`` (used by Alembic and create_all).
"""

from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
