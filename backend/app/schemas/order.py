from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional, List


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_id: int
    status: Optional[str] = "PENDING"
    currency: Optional[str] = "INR"
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    currency: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    customer_id: int
    order_date: datetime
    status: str
    total_amount: Decimal
    currency: str
    items: List[OrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)
