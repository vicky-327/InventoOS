from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from fastapi import HTTPException

def create_order(db: Session, tenant_id: int, user_id: int, data: OrderCreate) -> Order:
    total_amount = 0
    items = []
    
    for item_in in data.items:
        # Use with_for_update to avoid race conditions during stock adjustment
        product = db.query(Product).filter(Product.tenant_id == tenant_id, Product.id == item_in.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_in.product_id} not found")
        if product.stock_quantity < item_in.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for product {product.name}")
            
        product.stock_quantity -= item_in.quantity
        line_total = float(product.price) * item_in.quantity
        total_amount += line_total
        
        items.append(
            OrderItem(
                tenant_id=tenant_id,
                product_id=product.id,
                quantity=item_in.quantity,
                unit_price=product.price
            )
        )
        
    order = Order(
        tenant_id=tenant_id,
        user_id=user_id,
        customer_id=data.customer_id,
        total_amount=total_amount,
        status="completed"
    )
    db.add(order)
    db.flush()
    
    for item in items:
        item.order_id = order.id
        db.add(item)
        
    db.commit()
    db.refresh(order)
    return order

def get_orders(db: Session, tenant_id: int, skip: int = 0, limit: int = 100):
    return db.query(Order).filter(Order.tenant_id == tenant_id).offset(skip).limit(limit).all()

def get_order(db: Session, tenant_id: int, order_id: int):
    order = db.query(Order).filter(Order.tenant_id == tenant_id, Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
