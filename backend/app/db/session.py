from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# Async SQLAlchemy engine using the async database URL from settings
engine = create_async_engine(settings.database_url_async, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db():
    """
    FastAPI dependency that yields an async database session.
    """
    async with SessionLocal() as session:
        yield session

