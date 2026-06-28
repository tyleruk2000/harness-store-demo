"""Small helpers to build/persist sample rows in tests."""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.product import Product, UseCase


def make_product(
    db: Session,
    *,
    name: str = "Test Harness",
    category: str = "harnesses",
    price: str | Decimal = "50.00",
    stock_quantity: int = 10,
    use_case: UseCase = UseCase.sport,
    featured: bool = False,
    rating: str | Decimal | None = "4.5",
    weight: str | Decimal | None = "300",
    colour: str | None = "Test Blue",
) -> Product:
    product = Product(
        name=name,
        category=category,
        short_description=f"{name} — a test product.",
        long_description="Longer test description.",
        price=Decimal(str(price)),
        image_url=f"/images/products/{name.lower().replace(' ', '-')}.webp",
        stock_quantity=stock_quantity,
        weight=Decimal(str(weight)) if weight is not None else None,
        colour=colour,
        use_case=use_case,
        rating=Decimal(str(rating)) if rating is not None else None,
        featured=featured,
    )
    db.add(product)
    db.flush()  # assign PK without ending the transaction
    return product


def order_payload(product_id: int, quantity: int = 1, **overrides: object) -> dict:
    payload = {
        "customer_email": "climber@example.com",
        "customer_name": "Test Climber",
        "address": "1 Boulder Lane",
        "city": "Sheffield",
        "postcode": "S1 2AB",
        "country": "United Kingdom",
        "payment_method": "card",
        "items": [{"product_id": product_id, "quantity": quantity}],
    }
    payload.update(overrides)
    return payload
