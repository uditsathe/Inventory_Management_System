from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..schemas.product import ProductCreate, ProductOut, ProductUpdate
from ..services.product_service import (
    create_product,
    list_products,
    get_product,
    update_product,
    delete_product,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductOut, status_code=201)
def create_product_endpoint(payload: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, payload)


@router.get("", response_model=list[ProductOut])
def list_products_endpoint(db: Session = Depends(get_db)):
    return list_products(db)


@router.get("/{product_id}", response_model=ProductOut)
def get_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    return get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductOut)
def update_product_endpoint(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    return update_product(db, product_id, payload)


@router.delete("/{product_id}", status_code=204)
def delete_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    delete_product(db, product_id)
    return None
