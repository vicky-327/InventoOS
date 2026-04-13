from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "mt_inventory_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"]
)
