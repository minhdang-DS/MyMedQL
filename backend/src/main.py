"""
MyMedQL FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .db.database import create_db_pool, close_db_pool
from .api import api_router

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for startup and shutdown
    """
    # Startup
    print("🚀 MyMedQL FastAPI Backend Starting...")
    print(f"   Environment: {settings.environment}")
    print(f"   Version: {settings.app_version}")
    
    # Initialize database connection pool
    create_db_pool()
    
    yield
    
    # Shutdown
    print("👋 Shutting down gracefully...")
    close_db_pool()


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "framework": "FastAPI",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "api_info": "/api",
            "health_check_data": "/api/health-check"
        }
    }


# Include API routes
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )

