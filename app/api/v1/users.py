from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_tenant_id, get_current_user, get_current_active_admin
from app.schemas.user import UserResponse, UserCreate
from app.models.user import User
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_admin = Depends(get_current_active_admin)
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already registered")
    user = User(
        tenant_id=tenant_id,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
    current_admin = Depends(get_current_active_admin)
):
    return db.query(User).filter(User.tenant_id == tenant_id).offset(skip).limit(limit).all()
