"""FastAPI application entrypoint.

Wires CORS, the API routers, and friendly OpenAPI metadata. Swagger UI is served
at /docs and the raw schema at /openapi.json (FastAPI defaults).
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=(
        "Backend for **Crux** — a demo climbing-gear store. "
        "Products, a stock-safe order flow, and order history. "
        "Write endpoints require the `X-Admin-Passcode` header."
    ),
    contact={"name": "Crux demo"},
)

# Same-origin requests via the Next.js /api proxy don't need CORS, but explicit
# origins keep direct browser calls (and local dev tools) working.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-Admin-Passcode"],
)

app.include_router(api_router)


@app.get("/", tags=["system"], include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": "Crux API", "docs": "/docs", "health": "/health"}
