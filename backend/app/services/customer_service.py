from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from ..models.customer import Customer
from ..schemas.customer import CustomerCreate, CustomerUpdate
from .audit_service import log_action


def customer_to_dict(customer: Customer) -> dict:
    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "street": customer.street,
        "city": customer.city,
        "state": customer.state,
        "postal_code": customer.postal_code,
        "country": customer.country,
    }


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    customer = Customer(**data.model_dump())
    db.add(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email must be unique.")
    db.refresh(customer)
    log_action(db, entity_type="Customer", entity_id=customer.id, action="CREATE", after=customer_to_dict(customer))
    return customer


def list_customers(db: Session) -> list[Customer]:
    return db.query(Customer).order_by(Customer.full_name).all()


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


def update_customer(db: Session, customer_id: int, data: CustomerUpdate) -> Customer:
    customer = get_customer(db, customer_id)
    before = customer_to_dict(customer)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email must be unique.")
    db.refresh(customer)
    log_action(db, entity_type="Customer", entity_id=customer.id, action="UPDATE", before=before, after=customer_to_dict(customer))
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    before = customer_to_dict(customer)
    db.delete(customer)
    db.commit()
    log_action(db, entity_type="Customer", entity_id=customer_id, action="DELETE", before=before, after=None)
