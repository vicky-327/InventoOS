from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.tenant import TenantCreate, TenantResponse
from app.schemas.token import Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TenantResponse)
def register_tenant(tenant_in: TenantCreate, db: Session = Depends(get_db)):
    # Check if tenant exists
    tenant = db.query(Tenant).filter(Tenant.name == tenant_in.name).first()
    if tenant:
        raise HTTPException(status_code=400, detail="Tenant name already registered")
        
    # Check if admin email exists globally
    user = db.query(User).filter(User.email == tenant_in.admin_email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create tenant
    new_tenant = Tenant(name=tenant_in.name)
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    
    # Create admin user for this tenant
    hashed_password = get_password_hash(tenant_in.admin_password)
    new_user = User(
        tenant_id=new_tenant.id,
        email=tenant_in.admin_email,
        hashed_password=hashed_password,
        full_name=tenant_in.admin_full_name,
        is_admin=True
    )
    db.add(new_user)
    db.commit()
    
    return new_tenant

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    # Subject encompasses user.id and tenant_id to make contextual isolation easy
    token_sub = f"{user.id}:{user.tenant_id}"
    access_token = create_access_token(subject=token_sub)
    
    return {"access_token": access_token, "token_type": "bearer"}
