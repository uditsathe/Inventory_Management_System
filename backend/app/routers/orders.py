from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..schemas.order import OrderCreate, OrderOut, OrderUpdate
from ..services.order_service import (
    create_order,
    list_orders,
    get_order,
    update_order,
    delete_order,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order_endpoint(payload: OrderCreate, db: Session = Depends(get_db)):
    return create_order(db, payload)


@router.get("", response_model=list[OrderOut])
def list_orders_endpoint(db: Session = Depends(get_db)):
    return list_orders(db)


@router.get("/{order_id}", response_model=OrderOut)
def get_order_endpoint(order_id: int, db: Session = Depends(get_db)):
    return get_order(db, order_id)


@router.put("/{order_id}", response_model=OrderOut)
def update_order_endpoint(order_id: int, payload: OrderUpdate, db: Session = Depends(get_db)):
    return update_order(db, order_id, payload)


@router.delete("/{order_id}", status_code=204)
def delete_order_endpoint(order_id: int, db: Session = Depends(get_db)):
    delete_order(db, order_id)
    return None
