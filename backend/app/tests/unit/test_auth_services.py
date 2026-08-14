from app.core.deps import get_current_user
from app.schemas.user_schema import UserLogin
from app.services.auth_services import authenticate_user, create_auth_session
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession


async def test_create_auth_session(
    db_session: AsyncSession,
    created_user_id: int,
) -> None:
    auth_session = await create_auth_session(
        user_id=created_user_id,
        user_agent="test",
        ip_address="127.0.0.1",
        raw_refresh_token="test-refresh-token",
        db=db_session,
    )
    assert auth_session.user_id == created_user_id
    assert auth_session.user_agent == "test"
    assert auth_session.ip_address == "127.0.0.1"
    assert auth_session.refresh_token_hash
    assert auth_session.expires_at
    assert auth_session.created_at


async def test_authenticate_user(
    db_session: AsyncSession,
    created_user_id: int,
) -> None:
    response = await authenticate_user(
        ip_address="127.0.0.1",
        user_agent="test",
        user_data=UserLogin(email="test@example.com", password="Test@password123"),
        db=db_session,
    )
    assert response["access_token"] is not None
    assert response["refresh_token"] is not None


async def test_get_current_user(
    db_session: AsyncSession,
    authenticated_client: dict[str, str],
) -> None:
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=authenticated_client["access_token"],
    )
    user = await get_current_user(
        credentials=credentials,
        db=db_session,
    )
    assert user.email == "test@example.com"
    assert user.first_name == "Test"
    assert user.last_name == "User"
