"""Order endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, PaginationParams
from app.schemas.order import OrderCreate, OrderRead
from app.services import order_service
from app.services.order_service import InsufficientStockError, ProductNotFoundError

router = APIRouter(tags=["orders"])


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: DbSession) -> OrderRead:
    try:
        order = order_service.create_order(db, payload)
    except ProductNotFoundError as exc:
        # Body referenced a product that doesn't exist → 422 (unprocessable).
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown product_id {exc.product_id}",
        ) from exc
    except InsufficientStockError as exc:
        # Current-state conflict → 409.
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={
                "message": f"Insufficient stock for product {exc.product_id}",
                "product_id": exc.product_id,
                "requested": exc.requested,
                "available": exc.available,
            },
        ) from exc
    return OrderRead.model_validate(order)


@router.get("/orders", response_model=list[OrderRead])
def list_orders(db: DbSession, page: PaginationParams) -> list[OrderRead]:
    orders = order_service.list_orders(db, limit=page.limit, offset=page.offset)
    return [OrderRead.model_validate(o) for o in orders]


@router.get("/orders/by-email/{email}", response_model=list[OrderRead])
def orders_by_email(email: str, db: DbSession) -> list[OrderRead]:
    orders = order_service.list_orders_by_email(db, email)
    return [OrderRead.model_validate(o) for o in orders]


@router.get("/orders/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: DbSession) -> OrderRead:
    order = order_service.get_order(db, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Order not found")
    return OrderRead.model_validate(order)
