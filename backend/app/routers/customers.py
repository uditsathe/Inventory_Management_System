from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from ..services.customer_service import (
    create_customer,
    list_customers,
    get_customer,
    update_customer,
    delete_customer,
)

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer_endpoint(payload: CustomerCreate, db: Session = Depends(get_db)):
    return create_customer(db, payload)


@router.get("", response_model=list[CustomerOut])
def list_customers_endpoint(db: Session = Depends(get_db)):
    return list_customers(db)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer_endpoint(customer_id: int, db: Session = Depends(get_db)):
    return get_customer(db, customer_id)


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer_endpoint(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    return update_customer(db, customer_id, payload)


@router.delete("/{customer_id}", status_code=204)
def delete_customer_endpoint(customer_id: int, db: Session = Depends(get_db)):
    delete_customer(db, customer_id)
    return None
