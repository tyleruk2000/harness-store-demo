"""Product read/query + create logic."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product, UseCase
from app.schemas.product import ProductCreate, ProductUpdate


def list_products(
    db: Session,
    *,
    category: str | None = None,
    use_case: UseCase | None = None,
    featured: bool | None = None,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Product]:
    stmt = select(Product)
    if category:
        stmt = stmt.where(func.lower(Product.category) == category.lower())
    if use_case is not None:
        stmt = stmt.where(Product.use_case == use_case)
    if featured is not None:
        stmt = stmt.where(Product.featured.is_(featured))
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(
            func.lower(Product.name).like(like) | func.lower(Product.short_description).like(like)
        )
    stmt = stmt.order_by(Product.featured.desc(), Product.name).limit(limit).offset(offset)
    return list(db.execute(stmt).scalars().all())


def get_product(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def list_featured(db: Session, limit: int = 8) -> list[Product]:
    stmt = (
        select(Product)
        .where(Product.featured.is_(True))
        .order_by(Product.rating.desc().nullslast(), Product.name)
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


def list_related(db: Session, product: Product, limit: int = 4) -> list[Product]:
    """Other products in the same category (fallback to any) — for the detail page."""
    stmt = (
        select(Product)
        .where(Product.category == product.category, Product.id != product.id)
        .order_by(Product.featured.desc(), Product.rating.desc().nullslast())
        .limit(limit)
    )
    related = list(db.execute(stmt).scalars().all())
    if len(related) < limit:
        extra = (
            select(Product)
            .where(Product.id != product.id, Product.category != product.category)
            .order_by(Product.featured.desc())
            .limit(limit - len(related))
        )
        related.extend(db.execute(extra).scalars().all())
    return related


def list_categories(db: Session) -> list[dict[str, object]]:
    stmt = (
        select(Product.category, func.count(Product.id))
        .group_by(Product.category)
        .order_by(Product.category)
    )
    return [{"name": name, "count": count} for name, count in db.execute(stmt).all()]


def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, payload: ProductUpdate) -> Product:
    """Apply a partial update (only the fields actually supplied)."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product
