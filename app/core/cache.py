import redis
import json
from app.core.config import settings

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_cache(tenant_id: int, key: str):
    full_key = f"tenant:{tenant_id}:{key}"
    val = redis_client.get(full_key)
    if val:
        return json.loads(val)
    return None

def set_cache(tenant_id: int, key: str, value: dict, expiration: int = 3600):
    full_key = f"tenant:{tenant_id}:{key}"
    redis_client.setex(full_key, expiration, json.dumps(value))

def invalidate_cache(tenant_id: int, key: str):
    full_key = f"tenant:{tenant_id}:{key}"
    redis_client.delete(full_key)
