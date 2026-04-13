from pydantic import BaseModel
from datetime import datetime
from typing import List

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_id: int | None = None
    items: List[OrderItemBase]

class OrderItemResponse(OrderItemBase):
    id: int
    unit_price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    tenant_id: int
    user_id: int
    customer_id: int | None = None
    status: str
    total_amount: float
    created_at: datetime
    updated_at: datetime | None = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
