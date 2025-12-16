import os
import logging

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncEngine

from app.api.dependencies import get_connection_manager
from app.api.routers import api_router
from app.core.config import settings
from app.db import base  # noqa: F401  # ensures models are imported
from app.db.base import Base
from app.db.session import engine

logger = logging.getLogger(__name__)

app = FastAPI(title="MyMedQL Backend", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.on_event("startup")
async def on_startup():
    if os.getenv("SKIP_DB_INIT") == "1":
        logger.info("Skipping DB init as SKIP_DB_INIT=1")
        return
    try:
        await create_tables(engine)
        logger.info("Database tables created successfully")
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("DB init skipped due to error: %s", exc)


async def create_tables(db_engine: AsyncEngine):
    async with db_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "MyMedQL Backend"}


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, manager=Depends(get_connection_manager)
):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)



