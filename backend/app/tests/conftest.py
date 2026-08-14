import os
from collections.abc import AsyncGenerator

os.environ["ENVIRONMENT"] = "test"

import pytest_asyncio
from app.config import get_settings
from app.database import AsyncSessionLocal, engine
from app.main import app
from app.models.base import Base
from app.models.enums import TextDirection
from app.models.language import Language
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
async def created_user_id(client: AsyncClient) -> int:
    user_register_data = {
        "email": "test@example.com",
        "password": "Test@password123",
        "first_name": "Test",
        "last_name": "User",
    }
    response = await client.post("/auth/register", json=user_register_data)
    assert response.status_code == 201
    return response.json()["id"]


@pytest_asyncio.fixture
async def another_created_user_id(client: AsyncClient) -> int:
    user_register_data = {
        "email": "another@example.com",
        "password": "Test@password123",
        "first_name": "Another",
        "last_name": "User",
    }
    response = await client.post("/auth/register", json=user_register_data)
    assert response.status_code == 201
    return response.json()["id"]


@pytest_asyncio.fixture
async def authenticated_client(
    client: AsyncClient, created_user_id: int
) -> dict[str, str | AsyncClient]:
    response = await client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "Test@password123"},
    )
    assert response.status_code == 200
    return {
        "access_token": response.json()["access_token"],
        "client": client,
    }


@pytest_asyncio.fixture
async def another_authenticated_client(
    client: AsyncClient,
    another_created_user_id: int,
) -> dict[str, str | AsyncClient]:
    response = await client.post(
        "/auth/login",
        json={"email": "another@example.com", "password": "Test@password123"},
    )
    assert response.status_code == 200
    return {
        "access_token": response.json()["access_token"],
        "client": client,
    }


@pytest_asyncio.fixture
async def created_languages(db_session: AsyncSession) -> list[Language]:
    languages = [
        Language(
            code="en",
            name="English",
            native_name="English",
            direction=TextDirection.LTR,
        ),
        Language(
            code="fr",
            name="French",
            native_name="Français",
            direction=TextDirection.LTR,
        ),
        Language(
            code="es",
            name="Spanish",
            native_name="Español",
            direction=TextDirection.LTR,
        ),
        Language(
            code="ar",
            name="Arabic",
            native_name="العربية",
            direction=TextDirection.RTL,
        ),
        Language(
            code="am",
            name="Amharic",
            native_name="አማርኛ",
            direction=TextDirection.LTR,
        ),
    ]
    db_session.add_all(languages)
    await db_session.commit()
    for language in languages:
        await db_session.refresh(language)
    return languages


@pytest_asyncio.fixture
async def created_projects(
    authenticated_client: dict[str, str | AsyncClient],
    created_languages: list[Language],
) -> list[dict]:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    projects = []
    for language in created_languages:
        response = await client.post(
            "/projects/create",
            json={
                "name": f"Test Project {language.code}",
                "description": "Test Description",
                "default_language_id": language.id,
            },
            headers=headers,
        )
        assert response.status_code == 201
        body = response.json()
        assert "default_language" in body
        assert body["default_language"]["id"] == language.id
        assert body["default_language"]["code"] == language.code
        assert "default_language_id" not in body
        projects.append(body)
    return projects


@pytest_asyncio.fixture
async def created_phrases(
    authenticated_client: dict[str, str | AsyncClient],
    created_projects: list[dict],
) -> list[dict]:
    client = authenticated_client["client"]
    headers = {"Authorization": f"Bearer {authenticated_client['access_token']}"}
    project_id = created_projects[0]["id"]
    phrase_payloads = [
        {
            "project_id": project_id,
            "key": "welcome.title",
            "source_text": "Welcome",
            "context": "Home page heading",
            "usage": "Displayed at top of home",
        },
        {
            "project_id": project_id,
            "key": "welcome.subtitle",
            "source_text": "Get started",
            "context": "Home page subtitle",
            "usage": None,
        },
        {
            "project_id": project_id,
            "key": "button.save",
            "source_text": "Save",
            "context": None,
            "usage": "Primary save button",
        },
        {
            "project_id": project_id,
            "key": "button.cancel",
            "source_text": "Cancel",
            "context": None,
            "usage": None,
        },
        {
            "project_id": project_id,
            "key": "error.not_found",
            "source_text": "Not found",
            "context": "404 page",
            "usage": "Shown when resource is missing",
        },
    ]
    phrases = []
    for payload in phrase_payloads:
        response = await client.post(
            "/phrases/createPhrase",
            json=payload,
            headers=headers,
        )
        assert response.status_code == 201
        body = response.json()
        assert body["project_id"] == project_id
        assert body["key"] == payload["key"]
        phrases.append(body)
    return phrases
