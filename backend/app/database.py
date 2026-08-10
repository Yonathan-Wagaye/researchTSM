from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import get_settings

settings = get_settings()

if settings.ENVIRONMENT == "test":
    engine = create_async_engine(settings.active_database_url, poolclass=NullPool)
else:
    engine = create_async_engine(
        settings.active_database_url,
        echo=settings.ENVIRONMENT == "development",
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
