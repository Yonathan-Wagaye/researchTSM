from app.schemas.User import UserLogin
from app.services.auth_services import authenticate_user, create_auth_session
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
