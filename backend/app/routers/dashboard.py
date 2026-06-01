from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..db import get_db
from ..models.product import Product
from ..models.customer import Customer
from ..models.order import Order, OrderItem

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()

    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0

    low_stock_products = (
        db.query(Product)
        .filter(Product.quantity_in_stock <= Product.reorder_level, Product.archived == False)
        .limit(10)
        .all()
    )

    best_sellers = (
        db.query(Product.name, func.sum(OrderItem.quantity).label("total_qty"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    return {
        "totals": {
            "products": total_products,
            "customers": total_customers,
            "orders": total_orders,
            "revenue": float(total_revenue),
        },
        "low_stock": [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "quantity_in_stock": p.quantity_in_stock,
                "reorder_level": p.reorder_level,
            }
            for p in low_stock_products
        ],
        "best_sellers": [
            {"name": row.name, "total_quantity": int(row.total_qty or 0)}
            for row in best_sellers
        ],
    }


@router.get("/orders_volume")
def get_orders_volume(db: Session = Depends(get_db), days: int = 14):
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)

    rows = (
        db.query(
            func.date(Order.order_date).label("day"),
            func.count(Order.id).label("count"),
        )
        .filter(Order.order_date >= start_date, Order.order_date <= end_date)
        .group_by(func.date(Order.order_date))
        .order_by(func.date(Order.order_date))
        .all()
    )

    counts_by_day = {str(row.day): int(row.count) for row in rows}

    data = []
    current = start_date
    while current <= end_date:
        data.append({"day": current.isoformat(), "count": counts_by_day.get(current.isoformat(), 0)})
        current += timedelta(days=1)

    return {"start": start_date.isoformat(), "end": end_date.isoformat(), "points": data}
