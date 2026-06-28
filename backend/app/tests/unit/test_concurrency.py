"""Concurrency: two orders racing for the last unit of stock.

Requires real Postgres — SELECT ... FOR UPDATE is what serializes the two
transactions. On SQLite this is skipped (it can't enforce row locks).
"""

from __future__ import annotations

import threading
from decimal import Decimal

import pytest
from sqlalchemy import delete, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.product import Product, UseCase
from app.schemas.order import OrderCreate
from app.services import order_service
from app.services.order_service import InsufficientStockError
from app.tests.factories import order_payload

pytestmark = pytest.mark.postgres


def _make_committed_product(engine: Engine, stock: int) -> int:
    with Session(engine) as s:
        p = Product(
            name="Race Harness",
            category="harnesses",
            short_description="last one in stock",
            long_description="",
            price=Decimal("99.00"),
            image_url="",
            stock_quantity=stock,
            use_case=UseCase.sport,
            featured=False,
        )
        s.add(p)
        s.commit()
        return p.id


def _cleanup(engine: Engine, product_id: int) -> None:
    with Session(engine) as s:
        order_ids = [
            row[0]
            for row in s.execute(
                text("SELECT order_id FROM order_items WHERE product_id = :pid"),
                {"pid": product_id},
            )
        ]
        if order_ids:
            s.execute(delete(OrderItem).where(OrderItem.order_id.in_(order_ids)))
            s.execute(delete(Order).where(Order.id.in_(order_ids)))
        s.execute(delete(Product).where(Product.id == product_id))
        s.commit()


def test_two_orders_race_for_last_unit(engine: Engine):
    product_id = _make_committed_product(engine, stock=1)
    results: list[object] = []
    barrier = threading.Barrier(2)

    def attempt() -> None:
        barrier.wait()  # maximise overlap
        with Session(engine) as session:
            try:
                order = order_service.create_order(
                    session, OrderCreate(**order_payload(product_id, quantity=1))
                )
                results.append(("ok", order.order_number))
            except InsufficientStockError:
                results.append(("stockout", None))

    threads = [threading.Thread(target=attempt) for _ in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    try:
        outcomes = sorted(r[0] for r in results)
        assert outcomes == ["ok", "stockout"], f"expected one of each, got {outcomes}"
        # final stock is exactly zero, never negative
        with Session(engine) as s:
            assert s.get(Product, product_id).stock_quantity == 0
    finally:
        _cleanup(engine, product_id)
