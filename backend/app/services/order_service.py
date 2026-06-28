"""Order creation — the correctness-critical part of the backend.

Placing an order must, atomically:
  1. validate every referenced product exists,
  2. validate sufficient stock,
  3. compute totals SERVER-SIDE (never trust client prices),
  4. decrement stock,
  5. persist the order + items in a single transaction.

Concurrency: product rows are locked with ``SELECT ... FOR UPDATE`` (in sorted id
order to avoid deadlocks) so two simultaneous orders for the last unit of stock
serialize — exactly one succeeds, stock never goes negative.
"""

from __future__ import annotations

import secrets
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate

CENTS = Decimal("0.01")


class OrderError(Exception):
    """Base class for order-domain errors."""


class ProductNotFoundError(OrderError):
    def __init__(self, product_id: int) -> None:
        self.product_id = product_id
        super().__init__(f"Unknown product_id {product_id}")


class InsufficientStockError(OrderError):
    def __init__(self, product_id: int, requested: int, available: int) -> None:
        self.product_id = product_id
        self.requested = requested
        self.available = available
        super().__init__(
            f"Insufficient stock for product {product_id}: "
            f"requested {requested}, available {available}"
        )


def generate_order_number() -> str:
    """Human-readable, roughly sortable, collision-resistant: CRX-YYYYMMDD-XXXXXXXX."""
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"CRX-{stamp}-{secrets.token_hex(4).upper()}"


def compute_shipping(subtotal: Decimal) -> Decimal:
    if subtotal >= settings.FREE_SHIPPING_THRESHOLD:
        return Decimal("0.00")
    return settings.SHIPPING_FLAT.quantize(CENTS)


def create_order(db: Session, payload: OrderCreate) -> Order:
    # 1. Aggregate quantities per product (a client may send duplicate lines).
    requested: dict[int, int] = defaultdict(int)
    for item in payload.items:
        requested[item.product_id] += item.quantity
    product_ids = sorted(requested)  # deterministic lock order → no deadlocks

    # 2. Lock the product rows for the duration of this transaction.
    rows = (
        db.execute(
            select(Product)
            .where(Product.id.in_(product_ids))
            .order_by(Product.id)
            .with_for_update()
        )
        .scalars()
        .all()
    )
    found = {p.id: p for p in rows}

    missing = [pid for pid in product_ids if pid not in found]
    if missing:
        raise ProductNotFoundError(missing[0])

    # 3. Validate stock under the lock.
    for pid in product_ids:
        if found[pid].stock_quantity < requested[pid]:
            raise InsufficientStockError(pid, requested[pid], found[pid].stock_quantity)

    # 4. Build order + items; compute totals server-side from DB prices.
    order = Order(
        order_number=generate_order_number(),
        customer_email=str(payload.customer_email),
        customer_name=payload.customer_name,
        address=payload.address,
        city=payload.city,
        postcode=payload.postcode,
        country=payload.country,
        payment_method=payload.payment_method,
        status=OrderStatus.paid,  # demo: orders are paid immediately
        subtotal=Decimal("0.00"),
        shipping=Decimal("0.00"),
        total=Decimal("0.00"),
    )

    subtotal = Decimal("0.00")
    for pid in product_ids:
        product = found[pid]
        qty = requested[pid]
        line_total = (product.price * qty).quantize(CENTS)
        subtotal += line_total
        order.items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=qty,
                line_total=line_total,
            )
        )

    # 5. Decrement stock under the same lock.
    for pid in product_ids:
        found[pid].stock_quantity -= requested[pid]

    shipping = compute_shipping(subtotal)
    order.subtotal = subtotal.quantize(CENTS)
    order.shipping = shipping
    order.total = (subtotal + shipping).quantize(CENTS)

    # 6. One atomic commit — order, items, and stock decrements all-or-nothing.
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order(db: Session, order_id: int) -> Order | None:
    return db.get(Order, order_id)


def get_order_by_number(db: Session, order_number: str) -> Order | None:
    return db.execute(
        select(Order).where(Order.order_number == order_number)
    ).scalar_one_or_none()


def list_orders(db: Session, *, limit: int = 100, offset: int = 0) -> list[Order]:
    stmt = select(Order).order_by(Order.created_at.desc()).limit(limit).offset(offset)
    return list(db.execute(stmt).scalars().all())


def list_orders_by_email(db: Session, email: str) -> list[Order]:
    stmt = (
        select(Order)
        .where(func.lower(Order.customer_email) == email.lower())
        .order_by(Order.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())
