"""Product model."""

from __future__ import annotations

import enum
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Enum, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UseCase(str, enum.Enum):
    """Climbing discipline a product is built for."""

    sport = "sport"
    trad = "trad"
    alpine = "alpine"
    indoor = "indoor"
    big_wall = "big wall"  # value carries the space; member name can't


# Stored as VARCHAR + CHECK (native_enum=False) rather than a native PG enum:
# portable to SQLite for fast tests and far easier to evolve in Alembic.
_USE_CASE = Enum(UseCase, native_enum=False, length=20, values_callable=lambda e: [m.value for m in e])


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(60), index=True, nullable=False)
    short_description: Mapped[str] = mapped_column(String(300), nullable=False)
    long_description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    weight: Mapped[Decimal | None] = mapped_column(Numeric(7, 1))  # grams
    colour: Mapped[str | None] = mapped_column(String(60))
    use_case: Mapped[UseCase] = mapped_column(_USE_CASE, index=True, nullable=False)
    rating: Mapped[Decimal | None] = mapped_column(Numeric(2, 1))  # 0.0 - 5.0
    featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_products_price_nonneg"),
        CheckConstraint("stock_quantity >= 0", name="ck_products_stock_nonneg"),
        CheckConstraint("rating IS NULL OR (rating >= 0 AND rating <= 5)", name="ck_products_rating_range"),
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<Product {self.id} {self.name!r} stock={self.stock_quantity}>"
