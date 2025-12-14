"""
API information endpoints
"""
from fastapi import APIRouter
from typing import Dict, Any

from ...config import get_settings
from ...db.database import _db_pool

router = APIRouter()
settings = get_settings()


@router.get("/")
async def api_info() -> Dict[str, Any]:
    """
    Get API information
    
    Returns:
        API metadata and status
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": settings.app_description,
        "framework": "FastAPI",
        "python_version": "3.11",
        "environment": settings.environment,
        "status": "running",
        "database": "connected" if _db_pool else "not_connected",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
            "api": "/api"
        }
    }

