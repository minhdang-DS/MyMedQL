from fastapi import APIRouter

from app.api.routers import alerts, patients, vitals

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(vitals.router, prefix="/vitals", tags=["vitals"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

__all__ = ["api_router"]
from . import auth, patients, vitals, health

__all__ = ["auth", "patients", "vitals", "health"]



