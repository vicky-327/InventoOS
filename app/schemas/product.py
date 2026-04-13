from pydantic import BaseModel, Field
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: str | None = None
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(default=0, ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: str | None = None
    price: float | None = None

class ProductResponse(ProductBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
