"""
Configuration management for MyMedQL backend
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # App info
    app_name: str = "MyMedQL API"
    app_version: str = "0.0.0"
    app_description: str = "Medical Query Language API"
    
    # Environment
    environment: str = os.getenv("NODE_ENV", "development")
    debug: bool = environment == "development"
    
    # Server
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "3001"))
    
    # Database
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "3306"))
    db_name: str = os.getenv("DB_NAME", "mymedql")
    db_user: str = os.getenv("DB_USER", "root")
    db_password: str = os.getenv("DB_PASSWORD", "root")
    
    # CORS
    cors_origins: list = ["*"]  # In production, specify exact origins
    
    # Connection pool
    db_pool_size: int = 10
    db_pool_name: str = "mymedql_pool"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

