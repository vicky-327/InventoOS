from pydantic import BaseModel
from datetime import datetime

class TenantBase(BaseModel):
    name: str

class TenantCreate(TenantBase):
    admin_email: str
    admin_password: str
    admin_full_name: str | None = None

class TenantResponse(TenantBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
