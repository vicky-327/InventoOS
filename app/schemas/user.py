from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    tenant_id: int
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
