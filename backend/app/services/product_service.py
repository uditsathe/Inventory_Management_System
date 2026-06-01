from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from ..models.product import Product
from ..schemas.product import ProductCreate, ProductUpdate
from .audit_service import log_action


def product_to_dict(product: Product) -> dict:
    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "category": product.category,
        "supplier": product.supplier,
        "unit": product.unit,
        "price": float(product.price),
        "quantity_in_stock": product.quantity_in_stock,
        "reorder_level": product.reorder_level,
        "archived": product.archived,
    }


def create_product(db: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU must be unique.")
    db.refresh(product)
    log_action(db, entity_type="Product", entity_id=product.id, action="CREATE", after=product_to_dict(product))
    return product


def list_products(db: Session) -> list[Product]:
    return db.query(Product).order_by(Product.name).all()


def get_product(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    before = product_to_dict(product)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    if product.quantity_in_stock is not None and product.quantity_in_stock < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity cannot be negative")
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU must be unique.")
    db.refresh(product)
    log_action(db, entity_type="Product", entity_id=product.id, action="UPDATE", before=before, after=product_to_dict(product))
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    before = product_to_dict(product)
    db.delete(product)
    db.commit()
    log_action(db, entity_type="Product", entity_id=product_id, action="DELETE", before=before, after=None)
