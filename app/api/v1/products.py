from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.dependencies import get_tenant_id, get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services import product as product_service

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=ProductResponse)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return product_service.create_product(db, tenant_id, product_in)

@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    sort_by: Optional[str] = Query(None, description="Sort order: 'price_asc' or 'price_desc'"),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return product_service.get_products(db, tenant_id, skip, limit, min_price, max_price, sort_by)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return product_service.get_product(db, tenant_id, product_id)

@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    return product_service.update_product(db, tenant_id, product_id, product_in)

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_user = Depends(get_current_user)
):
    product_service.delete_product(db, tenant_id, product_id)
    return {"ok": True}
