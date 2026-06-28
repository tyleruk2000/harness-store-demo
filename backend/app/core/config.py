"""Application configuration via environment variables (pydantic-settings).

Every tunable lives here so the app is fully environment-driven — no hardcoded
secrets, hosts, or business constants scattered through the code.
"""

from __future__ import annotations

from decimal import Decimal
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    # --- Identity ---
    PROJECT_NAME: str = "Crux API"
    ENV: str = "development"

    # --- Database ---
    # psycopg v3 driver. Overridden by DATABASE_URL env in Docker/compose.
    DATABASE_URL: str = "postgresql+psycopg://crux:crux@localhost:5432/crux"

    # --- CORS --- comma-separated string in env (a bare string, not JSON, so
    # pydantic-settings doesn't try to JSON-decode it). Split via cors_origins.
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- Admin guard --- protects write endpoints (POST /products) in this demo.
    ADMIN_PASSCODE: str = "belay-on"

    # --- Commerce rules (server-side totals) ---
    SHIPPING_FLAT: Decimal = Decimal("4.95")
    FREE_SHIPPING_THRESHOLD: Decimal = Decimal("75.00")
    CURRENCY: str = "GBP"

    # --- Startup behaviour ---
    # In Docker compose the entrypoint runs migrations + seed. Toggle off in
    # multi-replica orchestration where a one-shot job owns migrations instead.
    RUN_MIGRATIONS_ON_START: bool = True
    SEED_ON_STARTUP: bool = True

    @property
    def cors_origins(self) -> list[str]:
        """Allowed CORS origins, parsed from the comma-separated env string."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
