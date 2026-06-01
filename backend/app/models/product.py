from sqlalchemy import Column, Integer, String, Numeric, Boolean
from sqlalchemy.orm import relationship
from ..db import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(64), nullable=False, unique=True, index=True)
    category = Column(String(128), nullable=True)
    supplier = Column(String(255), nullable=True)
    unit = Column(String(32), nullable=True, default="pcs")
    price = Column(Numeric(10, 2), nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=0)
    archived = Column(Boolean, nullable=False, default=False)

    order_items = relationship("OrderItem", back_populates="product")
