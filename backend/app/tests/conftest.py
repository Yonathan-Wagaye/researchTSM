import os
from collections.abc import AsyncGenerator

from app.models.user import User

os.environ["ENVIRONMENT"] = "test"

import pytest_asyncio
from app.config import get_settings
from app.database import AsyncSessionLocal, engine
from app.main import app
from app.models.base import Base
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

settings = get_settings()

if settings.ENVIRONMENT != "test" or "test" not in settings.active_database_url:
    raise RuntimeError("Tests must run against a dedicated test database")


@pytest_asyncio.fixture(autouse=True)
async def reset_database() -> AsyncGenerator[None, None]:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    yield

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as test_client:
        yield test_client


@pytest_asyncio.fixture
async def created_user_id(client: AsyncClient) -> User:
    user_register_data = {
        "email": "test@example.com",
        "password": "Test@password123",
        "first_name": "Test",
        "last_name": "User",
    }
    response = await client.post("/auth/register", json=user_register_data)
    assert response.status_code == 201
    return response.json()["id"]
