import os
import logging

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncEngine

from app.api.dependencies import get_connection_manager
from app.api.routers import api_router
from app.db import base  # noqa: F401  # ensures models are imported
from app.db.base import Base
from app.db.session import engine

logger = logging.getLogger(__name__)

app = FastAPI(title="MyMedQL Backend", version="1.0")
app.include_router(api_router)


@app.on_event("startup")
async def on_startup():
    if os.getenv("SKIP_DB_INIT") == "1":
        logger.info("Skipping DB init as SKIP_DB_INIT=1")
        return
    try:
        await create_tables(engine)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("DB init skipped due to error: %s", exc)


async def create_tables(db_engine: AsyncEngine):
    async with db_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok"}


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
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, health, patients, vitals
from app.core.config import settings
from app.websockets.connection_manager import connection_manager


def create_app() -> FastAPI:
    app = FastAPI(title="MyMedQL API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_prefix = "/api/v1"
    app.include_router(auth.router, prefix=api_prefix, tags=["auth"])
    app.include_router(patients.router, prefix=api_prefix, tags=["patients"])
    app.include_router(vitals.router, prefix=api_prefix, tags=["vitals"])
    app.include_router(health.router, prefix="", tags=["health"])

    @app.websocket("/ws")
    async def websocket_endpoint(websocket):
        await connection_manager.connect(websocket)
        try:
            while True:
                await websocket.receive_text()
        except Exception:
            pass
        finally:
            await connection_manager.disconnect(websocket)

    return app


app = create_app()



