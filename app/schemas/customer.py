from pydantic import BaseModel, EmailStr
from datetime import datetime

class CustomerBase(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str | None = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    name: str | None = None

class CustomerResponse(CustomerBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
