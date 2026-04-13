from fastapi import APIRouter
from app.api.v1 import auth, products, orders, users, customers

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
api_router.include_router(users.router)
api_router.include_router(customers.router)
