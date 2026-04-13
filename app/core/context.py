from contextvars import ContextVar
from typing import Optional

tenant_id_var: ContextVar[Optional[int]] = ContextVar("tenant_id", default=None)
user_id_var: ContextVar[Optional[int]] = ContextVar("user_id", default=None)
