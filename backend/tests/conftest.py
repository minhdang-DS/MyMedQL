import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
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

# Use strict asyncio mode for pytest-asyncio
pytest_plugins = ('pytest_asyncio',)

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
os.environ.setdefault("SKIP_DB_INIT", "1")
test_engine = create_async_engine(TEST_DATABASE_URL, future=True)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine, expire_on_commit=False, class_=AsyncSession
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database():
    """Create database tables before tests."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await test_engine.dispose()


@pytest_asyncio.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    """Async session fixture for tests."""
    async with TestingSessionLocal() as test_session:
        yield test_session
        # Rollback any uncommitted changes
        await test_session.rollback()


@pytest.fixture(autouse=True)
def setup_dependencies():
    """Override app dependencies with test fixtures."""
    async def _get_session_override():
        async with TestingSessionLocal() as test_session:
            yield test_session

    app.dependency_overrides[get_db] = _get_session_override
    app.dependency_overrides[get_connection_manager] = lambda: connection_manager
    yield
    app.dependency_overrides = {}
    # Reset active websocket connections between tests
    connection_manager.active_connections.clear()


@pytest_asyncio.fixture
async def seeded_patient(session: AsyncSession) -> Patient:
    """Create a test patient with thresholds. Uses unique ID per test invocation."""
    import uuid
    unique_id = f"patient-{uuid.uuid4().hex[:8]}"
    
    patient = Patient(patient_id=unique_id, name="Test Patient")
    threshold = Threshold(patient_id=patient.patient_id, hr_max=120, spo2_min=92.0)
    session.add_all([patient, threshold])
    await session.commit()
    # Don't refresh - patient object is already attached and usable
    return patient


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)

