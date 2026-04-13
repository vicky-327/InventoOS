from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-tenant Inventory + Order Management System"
    
    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "mt_inventory_db"
    
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    DATABASE_URL: Optional[str] = None # Added for Render compatibility
    
    # Auth / JWT
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY"  # IMPORTANT: Change in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Redis for Caching and Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Prioritize DATABASE_URL (Render) over SQLALCHEMY_DATABASE_URI
        db_url = self.DATABASE_URL or self.SQLALCHEMY_DATABASE_URI
        
        if db_url and db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        
        if not db_url:
            db_url = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            
        self.SQLALCHEMY_DATABASE_URI = db_url
        self.DATABASE_URL = db_url # Keep them in sync

settings = Settings()
