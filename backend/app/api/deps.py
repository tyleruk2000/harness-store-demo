"""Shared API dependencies."""

# NOTE: intentionally NO `from __future__ import annotations` here — stringized
# annotations break FastAPI's resolution of `Annotated[int, Query(...)]` defaults
# inside a class-based dependency.

from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db

DbSession = Annotated[Session, Depends(get_db)]


class Pagination:
    def __init__(
        self,
        limit: Annotated[int, Query(ge=1, le=200)] = 100,
        offset: Annotated[int, Query(ge=0)] = 0,
    ) -> None:
        self.limit = limit
        self.offset = offset


PaginationParams = Annotated[Pagination, Depends(Pagination)]
