"""Order service: the correctness-critical logic."""

from __future__ import annotations

from decimal import Decimal

import pytest
from sqlalchemy import func, select

from app.models.order import Order, OrderStatus
from app.models.product import Product, UseCase
from app.schemas.order import OrderCreate
from app.services import order_service
from app.services.order_service import InsufficientStockError, ProductNotFoundError
from app.tests.factories import make_product, order_payload


def _create(db, payload_dict):
    return order_service.create_order(db, OrderCreate(**payload_dict))


def test_happy_path_creates_order_and_decrements_stock(db_session):
    product = make_product(db_session, price="89.00", stock_quantity=10)
    order = _create(db_session, order_payload(product.id, quantity=2))

    assert order.id is not None
    assert order.status is OrderStatus.paid
    assert order.subtotal == Decimal("178.00")
    assert len(order.items) == 1
    item = order.items[0]
    assert item.product_name == product.name
    assert item.unit_price == Decimal("89.00")
    assert item.quantity == 2
    assert item.line_total == Decimal("178.00")
    # stock decremented
    assert db_session.get(Product, product.id).stock_quantity == 8


def test_order_number_format(db_session):
    product = make_product(db_session)
    order = _create(db_session, order_payload(product.id))
    assert order.order_number.startswith("CRX-")
    parts = order.order_number.split("-")
    assert len(parts) == 3
    assert len(parts[1]) == 8 and parts[1].isdigit()  # YYYYMMDD
    assert len(parts[2]) == 8  # hex token (4 bytes)


def test_duplicate_line_items_are_aggregated(db_session):
    product = make_product(db_session, price="10.00", stock_quantity=5)
    payload = order_payload(product.id)
    payload["items"] = [
        {"product_id": product.id, "quantity": 2},
        {"product_id": product.id, "quantity": 1},
    ]
    order = _create(db_session, payload)
    assert order.subtotal == Decimal("30.00")
    assert db_session.get(Product, product.id).stock_quantity == 2


def test_insufficient_stock_raises_and_persists_nothing(db_session):
    product = make_product(db_session, stock_quantity=1)
    with pytest.raises(InsufficientStockError) as exc:
        _create(db_session, order_payload(product.id, quantity=5))
    assert exc.value.requested == 5
    assert exc.value.available == 1
    # validation fails before any decrement/commit — stock untouched, no order.
    assert db_session.get(Product, product.id).stock_quantity == 1
    assert db_session.scalar(select(func.count()).select_from(Order)) == 0


def test_unknown_product_raises(db_session):
    make_product(db_session)  # ensure table populated but use a bogus id
    with pytest.raises(ProductNotFoundError) as exc:
        _create(db_session, order_payload(999_999, quantity=1))
    assert exc.value.product_id == 999_999
    assert db_session.scalar(select(func.count()).select_from(Order)) == 0


def test_boundary_exact_stock_succeeds_and_zeroes(db_session):
    product = make_product(db_session, stock_quantity=3)
    order = _create(db_session, order_payload(product.id, quantity=3))
    assert order is not None
    assert db_session.get(Product, product.id).stock_quantity == 0


def test_multi_product_order_totals_and_stock(db_session):
    p1 = make_product(db_session, name="Rope", price="100.00", stock_quantity=4)
    p2 = make_product(db_session, name="Biner", price="15.50", stock_quantity=10)
    payload = order_payload(p1.id)
    payload["items"] = [
        {"product_id": p1.id, "quantity": 1},
        {"product_id": p2.id, "quantity": 2},
    ]
    order = _create(db_session, payload)
    assert order.subtotal == Decimal("131.00")  # 100 + 31
    assert db_session.get(Product, p1.id).stock_quantity == 3
    assert db_session.get(Product, p2.id).stock_quantity == 8


def test_rollback_on_failure_is_atomic(db_session, monkeypatch):
    """If commit fails mid-transaction, the whole unit of work rolls back —
    no order row persists (atomicity)."""
    product = make_product(db_session, stock_quantity=7)

    def boom():
        raise RuntimeError("simulated DB failure")

    monkeypatch.setattr(db_session, "commit", boom)
    with pytest.raises(RuntimeError):
        _create(db_session, order_payload(product.id, quantity=2))

    # restore commit, then roll back the failed unit of work
    monkeypatch.undo()
    db_session.rollback()

    # the partial order never persisted
    assert db_session.scalar(select(func.count()).select_from(Order)) == 0
