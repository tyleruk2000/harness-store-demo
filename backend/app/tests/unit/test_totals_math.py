"""Server-side totals: subtotal, flat vs free shipping, rounding."""

from __future__ import annotations

from decimal import Decimal

from app.core.config import settings
from app.schemas.order import OrderCreate
from app.services import order_service
from app.tests.factories import make_product, order_payload


def test_flat_shipping_below_threshold(db_session):
    product = make_product(db_session, price="20.00", stock_quantity=10)
    order = order_service.create_order(db_session, OrderCreate(**order_payload(product.id, 1)))
    assert order.subtotal == Decimal("20.00")
    assert order.shipping == settings.SHIPPING_FLAT
    assert order.total == Decimal("20.00") + settings.SHIPPING_FLAT


def test_free_shipping_at_threshold(db_session):
    product = make_product(db_session, price=str(settings.FREE_SHIPPING_THRESHOLD), stock_quantity=5)
    order = order_service.create_order(db_session, OrderCreate(**order_payload(product.id, 1)))
    assert order.shipping == Decimal("0.00")
    assert order.total == order.subtotal


def test_free_shipping_above_threshold(db_session):
    product = make_product(db_session, price="200.00", stock_quantity=5)
    order = order_service.create_order(db_session, OrderCreate(**order_payload(product.id, 1)))
    assert order.shipping == Decimal("0.00")
    assert order.total == Decimal("200.00")


def test_totals_are_two_decimal_places(db_session):
    product = make_product(db_session, price="19.99", stock_quantity=3)
    order = order_service.create_order(db_session, OrderCreate(**order_payload(product.id, 3)))
    assert order.subtotal == Decimal("59.97")
    assert order.total.as_tuple().exponent == -2


def test_compute_shipping_helper():
    assert order_service.compute_shipping(Decimal("10.00")) == settings.SHIPPING_FLAT
    assert order_service.compute_shipping(settings.FREE_SHIPPING_THRESHOLD) == Decimal("0.00")
    assert order_service.compute_shipping(Decimal("1000.00")) == Decimal("0.00")
