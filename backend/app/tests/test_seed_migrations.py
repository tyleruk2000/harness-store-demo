"""Seed idempotency + Alembic migration sanity."""

from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.core.config import settings
from app.db import seed as seed_module
from app.db.base import Base
from app.schemas.product import ProductRead

BACKEND_ROOT = Path(__file__).resolve().parents[2]


# ---------------- Seed ----------------

def test_seed_inserts_catalog(db_session):
    added = seed_module.seed(db_session)
    assert added == len(seed_module.PRODUCT_CATALOG)


def test_seed_is_idempotent(db_session):
    first = seed_module.seed(db_session)
    second = seed_module.seed(db_session)
    assert first == len(seed_module.PRODUCT_CATALOG)
    assert second == 0  # second run inserts nothing


def test_seed_covers_all_categories_and_use_cases(db_session):
    seed_module.seed(db_session)
    categories = {row["category"] for row in seed_module.PRODUCT_CATALOG}
    use_cases = {row["use_case"] for row in seed_module.PRODUCT_CATALOG}
    assert categories == {"harnesses", "helmets", "ropes", "carabiners"}
    assert use_cases == {"sport", "trad", "alpine", "indoor", "big wall"}
    assert any(row["featured"] for row in seed_module.PRODUCT_CATALOG)


def test_every_seed_row_validates_as_product_schema():
    for row in seed_module.PRODUCT_CATALOG:
        ProductRead.model_validate({"id": 1, **row})


def test_dump_sql_renders_inserts():
    sql = seed_module.dump_sql()
    assert sql.count("INSERT INTO products") == len(seed_module.PRODUCT_CATALOG)
    assert "ON CONFLICT DO NOTHING" in sql


# ---------------- Migration ----------------

def _alembic_config(url: str) -> Config:
    cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    cfg.set_main_option("sqlalchemy.url", url)
    return cfg


def test_migration_creates_and_drops_schema(tmp_path, monkeypatch):
    url = f"sqlite+pysqlite:///{tmp_path / 'migration.db'}"
    # env.py reads settings.DATABASE_URL at runtime — point it at the temp DB.
    monkeypatch.setattr(settings, "DATABASE_URL", url)
    cfg = _alembic_config(url)

    command.upgrade(cfg, "head")
    inspector = inspect(create_engine(url))
    tables = set(inspector.get_table_names())
    assert {"products", "orders", "order_items", "customers"} <= tables

    # the migration's tables/columns match the ORM metadata
    for table in ("products", "orders", "order_items"):
        migrated_cols = {c["name"] for c in inspector.get_columns(table)}
        model_cols = {c.name for c in Base.metadata.tables[table].columns}
        assert model_cols <= migrated_cols, f"{table}: missing {model_cols - migrated_cols}"

    command.downgrade(cfg, "base")
    assert "products" not in inspect(create_engine(url)).get_table_names()
