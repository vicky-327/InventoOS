from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from fastapi import HTTPException

def create_customer(db: Session, tenant_id: int, data: CustomerCreate) -> Customer:
    customer = Customer(**data.model_dump(), tenant_id=tenant_id)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

def get_customers(db: Session, tenant_id: int, skip: int = 0, limit: int = 100):
    return db.query(Customer).filter(Customer.tenant_id == tenant_id, Customer.is_deleted == False).offset(skip).limit(limit).all()

def get_customer(db: Session, tenant_id: int, customer_id: int):
    customer = db.query(Customer).filter(Customer.tenant_id == tenant_id, Customer.id == customer_id, Customer.is_deleted == False).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

def delete_customer(db: Session, tenant_id: int, customer_id: int):
    customer = get_customer(db, tenant_id, customer_id)
    customer.is_deleted = True
    db.commit()
