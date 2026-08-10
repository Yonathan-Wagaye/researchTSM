import pytest
from app.models.user import User
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_db_health(client: AsyncClient) -> None:
    response = await client.get("/health/database")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "database": "connected",
    }


@pytest.mark.asyncio
async def test_db_starts_empty(db_session: AsyncSession) -> None:
    result = await db_session.execute(select(func.count()).select_from(User))
    assert result.scalar_one() == 0
