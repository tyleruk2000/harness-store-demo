"""Aggregate all API routers into one."""

from __future__ import annotations

from fastapi import APIRouter

from app.api import admin, health, orders, products

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(admin.router)
