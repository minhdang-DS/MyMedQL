import asyncio
import os
from collections.abc import AsyncGenerator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.api.dependencies import connection_manager, get_connection_manager, get_db
from app.db.base import Base
from app.main import app
from app.models.patient import Patient
from app.models.threshold import Threshold


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
os.environ.setdefault("SKIP_DB_INIT", "1")
test_engine = create_async_engine(TEST_DATABASE_URL, future=True)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine, expire_on_commit=False, class_=AsyncSession
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def prepare_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await test_engine.dispose()


@pytest.fixture()
async def session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture(autouse=True)
def override_dependencies(session: AsyncSession):
    async def _get_session_override():
        yield session

    app.dependency_overrides[get_db] = _get_session_override
    app.dependency_overrides[get_connection_manager] = lambda: connection_manager
    yield
    app.dependency_overrides = {}
    # Reset active websocket connections between tests
    connection_manager.active_connections.clear()


@pytest.fixture()
async def seeded_patient(session: AsyncSession) -> Patient:
    patient = Patient(patient_id="patient-1", name="Test Patient")
    threshold = Threshold(patient_id=patient.patient_id, hr_max=120, spo2_min=92.0)
    session.add_all([patient, threshold])
    await session.commit()
    return patient


@pytest.fixture()
def client():
    return TestClient(app)

