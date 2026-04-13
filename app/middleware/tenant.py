from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.core.context import tenant_id_var, user_id_var
from jose import jwt, JWTError
from app.core.config import settings

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Default initialization for each request
        tenant_id_var.set(None)
        user_id_var.set(None)
        
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                sub = payload.get("sub")
                if sub and ":" in sub:
                    user_id, tenant_id = sub.split(":")
                    tenant_id_var.set(int(tenant_id))
                    user_id_var.set(int(user_id))
            except JWTError:
                pass  # Let the actual auth dependencies handle auth rejections
                
        response = await call_next(request)
        return response
