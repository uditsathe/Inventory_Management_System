from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import Optional


class ProductBase(BaseModel):
    name: str
    sku: str
    category: Optional[str] = None
    supplier: Optional[str] = None
    unit: Optional[str] = "pcs"
    price: Decimal
    quantity_in_stock: int
    reorder_level: int = 0
    archived: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[Decimal] = None
    quantity_in_stock: Optional[int] = None
    reorder_level: Optional[int] = None
    archived: Optional[bool] = None


class ProductOut(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
