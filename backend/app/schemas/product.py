"""Product request/response schemas (Pydantic v2).

Numeric money/measure fields are serialized as JSON numbers (not strings) so the
TypeScript frontend receives ``number`` directly. We keep ``Decimal`` internally
for correct server-side arithmetic and only coerce at the JSON boundary.
"""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.models.product import UseCase


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=60)
    short_description: str = Field(min_length=1, max_length=300)
    long_description: str = Field(default="", max_length=5000)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    image_url: str = Field(default="", max_length=500)
    stock_quantity: int = Field(default=0, ge=0)
    weight: Decimal | None = Field(default=None, ge=0)
    colour: str | None = Field(default=None, max_length=60)
    use_case: UseCase
    rating: Decimal | None = Field(default=None, ge=0, le=5)
    featured: bool = False

    @field_serializer("price", "weight", "rating", when_used="json")
    def _decimal_to_float(self, value: Decimal | None) -> float | None:
        return float(value) if value is not None else None


class ProductCreate(ProductBase):
    """Payload for POST /products (admin)."""


class ProductUpdate(BaseModel):
    """Partial update for PATCH /products/{id} (admin). All fields optional."""

    featured: bool | None = None
    stock_quantity: int | None = Field(default=None, ge=0)
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)

    @field_serializer("price", when_used="json")
    def _decimal_to_float(self, value: Decimal | None) -> float | None:
        return float(value) if value is not None else None


class ProductRead(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
