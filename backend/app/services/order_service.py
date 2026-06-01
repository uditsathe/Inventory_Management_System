from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.order import Order, OrderItem
from ..models.product import Product
from ..schemas.order import OrderCreate, OrderUpdate
from .audit_service import log_action


def order_to_dict(order: Order) -> dict:
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "order_date": order.order_date.isoformat(),
        "status": order.status,
        "total_amount": float(order.total_amount),
        "currency": order.currency,
    }


def create_order(db: Session, data: OrderCreate) -> Order:
    total = Decimal("0")
    resolved_items = []

    for item_data in data.items:
        product = db.get(Product, item_data.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item_data.product_id} not found",
            )
        if product.quantity_in_stock < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity_in_stock}",
            )
        unit_price = Decimal(str(product.price))
        line_total = unit_price * item_data.quantity
        total += line_total
        resolved_items.append((product, item_data.quantity, unit_price, line_total))

    order = Order(
        customer_id=data.customer_id,
        status=data.status or "PENDING",
        currency=data.currency or "INR",
        total_amount=total,
    )
    db.add(order)
    db.flush()

    for product, qty, unit_price, line_total in resolved_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=unit_price,
            line_total=line_total,
        )
        db.add(order_item)
        product.quantity_in_stock -= qty

    db.commit()
    db.refresh(order)
    log_action(db, entity_type="Order", entity_id=order.id, action="CREATE", after=order_to_dict(order))
    return order


def list_orders(db: Session) -> list[Order]:
    return db.query(Order).order_by(Order.order_date.desc()).all()


def get_order(db: Session, order_id: int) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def update_order(db: Session, order_id: int, data: OrderUpdate) -> Order:
    order = get_order(db, order_id)
    before = order_to_dict(order)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    log_action(db, entity_type="Order", entity_id=order.id, action="UPDATE", before=before, after=order_to_dict(order))
    return order


def delete_order(db: Session, order_id: int) -> None:
    order = get_order(db, order_id)
    before = order_to_dict(order)
    db.delete(order)
    db.commit()
    log_action(db, entity_type="Order", entity_id=order_id, action="DELETE", before=before, after=None)
