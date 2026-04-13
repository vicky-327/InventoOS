from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_tenant_id, get_current_user
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order as order_service

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return order_service.create_order(db, tenant_id, current_user.id, order_in)

@router.get("/", response_model=List[OrderResponse])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return order_service.get_orders(db, tenant_id, skip, limit)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return order_service.get_order(db, tenant_id, order_id)
