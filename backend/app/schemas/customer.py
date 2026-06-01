from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class CustomerBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class CustomerOut(CustomerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
