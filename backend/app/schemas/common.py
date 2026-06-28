"""Shared / system response schemas."""

from __future__ import annotations

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    database: str


class ReadyResponse(BaseModel):
    status: str
    service: str
    database: str


class Message(BaseModel):
    detail: str


class CategoryRead(BaseModel):
    """A product category with its live product count."""

    name: str
    count: int
