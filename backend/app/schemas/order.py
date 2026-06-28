"""Order request/response schemas (Pydantic v2)."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer

from app.models.order import OrderStatus


# ---------- Requests ----------

class OrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=99)


class OrderCreate(BaseModel):
    customer_email: EmailStr
    customer_name: str | None = Field(default=None, max_length=120)
    address: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=120)
    postcode: str = Field(min_length=1, max_length=20)
    country: str = Field(min_length=1, max_length=80)
    payment_method: str = Field(default="card", max_length=40)
    items: list[OrderItemCreate] = Field(min_length=1)
    # NOTE: no price/total fields — totals are ALWAYS computed server-side.


# ---------- Responses ----------

class OrderItemRead(BaseModel):
    product_id: int
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal
    model_config = ConfigDict(from_attributes=True)

    @field_serializer("unit_price", "line_total", when_used="json")
    def _money(self, value: Decimal) -> float:
        return float(value)


class OrderRead(BaseModel):
    id: int
    order_number: str
    customer_email: str
    customer_name: str | None
    address: str
    city: str
    postcode: str
    country: str
    payment_method: str
    status: OrderStatus
    subtotal: Decimal
    shipping: Decimal
    total: Decimal
    created_at: datetime
    items: list[OrderItemRead]
    model_config = ConfigDict(from_attributes=True)

    @field_serializer("subtotal", "shipping", "total", when_used="json")
    def _money(self, value: Decimal) -> float:
        return float(value)


class OrderConfirmation(BaseModel):
    """Slim confirmation returned right after placing an order."""

    order_number: str
    status: OrderStatus
    total: Decimal
    customer_email: str

    @field_serializer("total", when_used="json")
    def _money(self, value: Decimal) -> float:
        return float(value)
