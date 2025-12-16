"""
FastAPI main application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import patients, analytics, auth, websocket
from app.websocket.connection_manager import ConnectionManager
from app.websocket.poller import start_poller, stop_poller

# Global connection manager
connection_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting MyMedQL API...")
    await start_poller(connection_manager)
    websocket.set_manager(connection_manager)
    print("✅ MyMedQL API started")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down MyMedQL API...")
    await stop_poller()
    connection_manager.disconnect_all()
    print("✅ MyMedQL API stopped")


# Create FastAPI app instance with lifespan
app = FastAPI(
    title="MyMedQL API",
    description="Medical Query Language API for real-time patient vital monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(websocket.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "MyMedQL API", "version": "1.0.0"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

