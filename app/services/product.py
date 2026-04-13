from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from fastapi import HTTPException

def create_product(db: Session, tenant_id: int, data: ProductCreate) -> Product:
    product = Product(**data.model_dump(), tenant_id=tenant_id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def get_products(db: Session, tenant_id: int, skip: int = 0, limit: int = 100, min_price: float = None, max_price: float = None, sort_by: str = None):
    query = db.query(Product).filter(Product.tenant_id == tenant_id, Product.is_deleted == False)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    return query.offset(skip).limit(limit).all()

def get_product(db: Session, tenant_id: int, product_id: int):
    product = db.query(Product).filter(Product.tenant_id == tenant_id, Product.id == product_id, Product.is_deleted == False).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

def update_product(db: Session, tenant_id: int, product_id: int, data: ProductUpdate):
    product = get_product(db, tenant_id, product_id)
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, tenant_id: int, product_id: int):
    product = get_product(db, tenant_id, product_id)
    product.is_deleted = True
    db.commit()
