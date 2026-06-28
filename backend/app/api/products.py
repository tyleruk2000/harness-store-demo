"""Product + category endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DbSession, PaginationParams
from app.core.security import require_admin
from app.models.product import UseCase
from app.schemas.common import CategoryRead
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services import product_service

router = APIRouter(tags=["products"])


@router.get("/products", response_model=list[ProductRead])
def list_products(
    db: DbSession,
    page: PaginationParams,
    category: str | None = None,
    use_case: UseCase | None = None,
    featured: bool | None = None,
    search: str | None = None,
) -> list[ProductRead]:
    products = product_service.list_products(
        db,
        category=category,
        use_case=use_case,
        featured=featured,
        search=search,
        limit=page.limit,
        offset=page.offset,
    )
    return [ProductRead.model_validate(p) for p in products]


@router.get("/products/featured", response_model=list[ProductRead])
def featured_products(db: DbSession) -> list[ProductRead]:
    return [ProductRead.model_validate(p) for p in product_service.list_featured(db)]


@router.get("/products/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: DbSession) -> ProductRead:
    product = product_service.get_product(db, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductRead.model_validate(product)


@router.get("/products/{product_id}/related", response_model=list[ProductRead])
def related_products(product_id: int, db: DbSession) -> list[ProductRead]:
    product = product_service.get_product(db, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Product not found")
    return [ProductRead.model_validate(p) for p in product_service.list_related(db, product)]


@router.post(
    "/products",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_product(payload: ProductCreate, db: DbSession) -> ProductRead:
    product = product_service.create_product(db, payload)
    return ProductRead.model_validate(product)


@router.patch(
    "/products/{product_id}",
    response_model=ProductRead,
    dependencies=[Depends(require_admin)],
)
def update_product(product_id: int, payload: ProductUpdate, db: DbSession) -> ProductRead:
    product = product_service.get_product(db, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Product not found")
    updated = product_service.update_product(db, product, payload)
    return ProductRead.model_validate(updated)


@router.get("/categories", response_model=list[CategoryRead])
def list_categories(db: DbSession) -> list[CategoryRead]:
    return [CategoryRead(**c) for c in product_service.list_categories(db)]
