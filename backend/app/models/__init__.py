"""Import every model so ``Base.metadata`` is complete.

Alembic's env.py and tests import this module (not the individual model files)
to guarantee all tables are registered before autogenerate / create_all.
"""

from app.models.customer import Customer  # noqa: F401
from app.models.order import Order, OrderItem, OrderStatus  # noqa: F401
from app.models.product import Product, UseCase  # noqa: F401

__all__ = ["Customer", "Order", "OrderItem", "OrderStatus", "Product", "UseCase"]
