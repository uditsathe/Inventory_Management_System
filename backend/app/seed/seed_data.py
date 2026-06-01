"""
Run via: python -m app.seed.seed_data
"""
from decimal import Decimal
from datetime import datetime, timedelta
import random
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from app.db import SessionLocal, engine, Base
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # --- Products ---
        products = [
            Product(name="Laptop Pro 15", sku="ELEC-LP15", category="Electronics", supplier="TechSupply Co.", unit="pcs", price=Decimal("75000.00"), quantity_in_stock=25, reorder_level=5),
            Product(name="Wireless Mouse", sku="ELEC-WM01", category="Electronics", supplier="TechSupply Co.", unit="pcs", price=Decimal("1200.00"), quantity_in_stock=120, reorder_level=20),
            Product(name="Mechanical Keyboard", sku="ELEC-MK02", category="Electronics", supplier="TechSupply Co.", unit="pcs", price=Decimal("3500.00"), quantity_in_stock=60, reorder_level=10),
            Product(name="USB-C Hub", sku="ELEC-UCH3", category="Electronics", supplier="GadgetZone", unit="pcs", price=Decimal("2200.00"), quantity_in_stock=4, reorder_level=10),
            Product(name="Monitor 27\" 4K", sku="ELEC-MON4K", category="Electronics", supplier="DisplayWorld", unit="pcs", price=Decimal("32000.00"), quantity_in_stock=15, reorder_level=3),
            Product(name="Webcam HD 1080p", sku="ELEC-WC1080", category="Electronics", supplier="GadgetZone", unit="pcs", price=Decimal("2800.00"), quantity_in_stock=2, reorder_level=5),
            Product(name="Clean Code", sku="BOOK-CC01", category="Books", supplier="BookHouse India", unit="pcs", price=Decimal("650.00"), quantity_in_stock=80, reorder_level=15),
            Product(name="The Pragmatic Programmer", sku="BOOK-TPP02", category="Books", supplier="BookHouse India", unit="pcs", price=Decimal("750.00"), quantity_in_stock=50, reorder_level=10),
            Product(name="Design Patterns", sku="BOOK-DP03", category="Books", supplier="BookHouse India", unit="pcs", price=Decimal("700.00"), quantity_in_stock=35, reorder_level=10),
            Product(name="Office Chair Ergonomic", sku="FURN-OCE1", category="Furniture", supplier="ComfortSeating", unit="pcs", price=Decimal("18000.00"), quantity_in_stock=8, reorder_level=2),
            Product(name="Standing Desk", sku="FURN-SD01", category="Furniture", supplier="ComfortSeating", unit="pcs", price=Decimal("25000.00"), quantity_in_stock=3, reorder_level=2),
            Product(name="Notebook A4 (Pack of 5)", sku="STAT-NB5", category="Stationery", supplier="OfficeNeeds", unit="pack", price=Decimal("250.00"), quantity_in_stock=200, reorder_level=50),
        ]
        db.add_all(products)
        db.flush()

        # --- Customers ---
        customers = [
            Customer(full_name="Arjun Sharma", email="arjun.sharma@example.com", phone="+91-9876543210", city="Bengaluru", state="Karnataka", country="India"),
            Customer(full_name="Priya Nair", email="priya.nair@example.com", phone="+91-9876500001", city="Mumbai", state="Maharashtra", country="India"),
            Customer(full_name="Rahul Gupta", email="rahul.gupta@example.com", phone="+91-9876500002", city="Delhi", state="Delhi", country="India"),
            Customer(full_name="Sneha Iyer", email="sneha.iyer@example.com", phone="+91-9876500003", city="Chennai", state="Tamil Nadu", country="India"),
            Customer(full_name="Vikram Patel", email="vikram.patel@example.com", phone="+91-9876500004", city="Ahmedabad", state="Gujarat", country="India"),
            Customer(full_name="Anjali Reddy", email="anjali.reddy@example.com", phone="+91-9876500005", city="Hyderabad", state="Telangana", country="India"),
        ]
        db.add_all(customers)
        db.flush()

        # --- Orders ---
        statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]
        order_templates = [
            (customers[0], [(products[0], 1), (products[1], 2)]),
            (customers[1], [(products[2], 1), (products[6], 1)]),
            (customers[2], [(products[4], 1)]),
            (customers[3], [(products[1], 3), (products[7], 2)]),
            (customers[4], [(products[9], 1), (products[11], 4)]),
            (customers[5], [(products[3], 2), (products[5], 1)]),
            (customers[0], [(products[8], 1), (products[11], 10)]),
            (customers[1], [(products[10], 1)]),
        ]

        for i, (customer, line_items) in enumerate(order_templates):
            order_date = datetime.utcnow() - timedelta(days=random.randint(0, 13))
            total = Decimal("0")
            items_to_add = []
            for product, qty in line_items:
                unit_price = Decimal(str(product.price))
                line_total = unit_price * qty
                total += line_total
                items_to_add.append(OrderItem(
                    product_id=product.id,
                    quantity=qty,
                    unit_price=unit_price,
                    line_total=line_total,
                ))
            order = Order(
                customer_id=customer.id,
                order_date=order_date,
                status=statuses[i % len(statuses)],
                total_amount=total,
                currency="INR",
            )
            db.add(order)
            db.flush()
            for item in items_to_add:
                item.order_id = order.id
                db.add(item)

        db.commit()
        print("✅ Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
