from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_tenant_id, get_current_user
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services import customer as customer_service

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("/", response_model=CustomerResponse)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return customer_service.create_customer(db, tenant_id, customer_in)

@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return customer_service.get_customers(db, tenant_id, skip, limit)

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    customer_service.delete_customer(db, tenant_id, customer_id)
    return {"ok": True}
