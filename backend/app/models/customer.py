from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..db import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(64), nullable=True)

    street = Column(String(255), nullable=True)
    city = Column(String(128), nullable=True)
    state = Column(String(128), nullable=True)
    postal_code = Column(String(32), nullable=True)
    country = Column(String(128), nullable=True)

    orders = relationship("Order", back_populates="customer")
