"""API package"""
from fastapi import APIRouter

# Import routers
from .routes import health, api_info

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(health.router, tags=["health"])
api_router.include_router(api_info.router, prefix="/api", tags=["info"])

__all__ = ["api_router"]

