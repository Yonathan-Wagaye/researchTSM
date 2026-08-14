import logging
from datetime import datetime, timedelta, timezone

from app.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.exceptions.auth_exceptions import (
    EmailAlreadyExistsException,
    ExpiredRefreshTokenException,
    InvalidCredentialsException,
    InvalidRefreshTokenException,
    MissingRefreshTokenException,
)
from app.models.user import AuthSession, User
from app.schemas.user_schema import UserLogin, UserRegister, UserResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

settings = get_settings()
logger = logging.getLogger(__name__)


async def register_user(user_data: UserRegister, db: AsyncSession) -> UserResponse:
    logger.info("User registration attempt")
    existing_user = await db.execute(select(User).where(User.email == user_data.email))

    if existing_user.scalar_one_or_none():
        logger.warning("User registration rejected: email already exists")
        raise EmailAlreadyExistsException

    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        password_hash=hash_password(user_data.password),
    )

    db.add(new_user)

    try:
        await db.commit()
        await db.refresh(new_user)

    except IntegrityError as exc:
        await db.rollback()
        logger.warning("User registration failed: database integrity error")
        raise EmailAlreadyExistsException() from exc

    logger.info("User registration successful: user_id=%s", new_user.id)
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
    )


async def create_auth_session(
    user_id: int,
    user_agent: str | None,
    ip_address: str | None,
    raw_refresh_token: str,
    db: AsyncSession,
) -> AuthSession:
    refresh_token_hash = hash_refresh_token(raw_refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
    )
    auth_session = AuthSession(
        user_id=user_id,
        refresh_token_hash=refresh_token_hash,
        expires_at=expires_at,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(auth_session)
    try:
        await db.commit()
        await db.refresh(auth_session)
    except IntegrityError:
        await db.rollback()
        logger.exception("Authentication session creation failed: user_id=%s", user_id)
        raise

    logger.info(
        "Authentication session created: user_id=%s session_id=%s",
        user_id,
        auth_session.id,
    )
    return auth_session


async def authenticate_user(
    ip_address: str | None,
    user_agent: str | None,
    user_data: UserLogin,
    db: AsyncSession,
) -> dict[str, str]:
    logger.info("User login attempt: ip_address=%s", ip_address)
    user = await db.execute(select(User).where(User.email == user_data.email))
    user = user.scalar_one_or_none()

    if not user:
        logger.warning("User login failed: user not found ip_address=%s", ip_address)
        raise InvalidCredentialsException

    if not verify_password(user_data.password, user.password_hash):
        logger.warning(
            "User login failed: invalid password user_id=%s ip_address=%s",
            user.id,
            ip_address,
        )
        raise InvalidCredentialsException

    raw_refresh_token = create_refresh_token()
    await create_auth_session(user.id, user_agent, ip_address, raw_refresh_token, db)
    access_token = create_access_token(user.id)
    logger.info("User login successful: user_id=%s ip_address=%s", user.id, ip_address)
    return {
        "access_token": access_token,
        "refresh_token": raw_refresh_token,
    }


async def refresh_auth_session(
    refresh_token: str | None,
    db: AsyncSession,
) -> dict[str, str]:
    if not refresh_token:
        logger.warning("Token refresh failed: refresh token missing")
        raise MissingRefreshTokenException()

    token_hash = hash_refresh_token(refresh_token)
    result = await db.execute(
        select(AuthSession).where(AuthSession.refresh_token_hash == token_hash)
    )
    auth_session = result.scalar_one_or_none()

    if not auth_session:
        logger.warning("Token refresh failed: refresh token not found")
        raise InvalidRefreshTokenException()

    if auth_session.revoked_at is not None:
        logger.warning(
            "Token refresh failed: session revoked session_id=%s user_id=%s",
            auth_session.id,
            auth_session.user_id,
        )
        raise InvalidRefreshTokenException()

    now = datetime.now(timezone.utc)
    expires_at = auth_session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= now:
        logger.warning(
            "Token refresh failed: session expired session_id=%s user_id=%s",
            auth_session.id,
            auth_session.user_id,
        )
        raise ExpiredRefreshTokenException()

    new_refresh_token = create_refresh_token()
    auth_session.refresh_token_hash = hash_refresh_token(new_refresh_token)
    auth_session.last_used_at = now
    auth_session.expires_at = now + timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
    )

    try:
        await db.commit()
        await db.refresh(auth_session)
    except IntegrityError:
        await db.rollback()
        logger.exception(
            "Token refresh failed: could not rotate session session_id=%s",
            auth_session.id,
        )
        raise

    access_token = create_access_token(auth_session.user_id)
    logger.info(
        "Token refresh successful: session_id=%s user_id=%s",
        auth_session.id,
        auth_session.user_id,
    )
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
    }


async def logout_auth_session(
    refresh_token: str | None,
    db: AsyncSession,
) -> None:
    if not refresh_token:
        logger.info("Logout completed with no refresh token cookie")
        return

    token_hash = hash_refresh_token(refresh_token)
    result = await db.execute(
        select(AuthSession).where(AuthSession.refresh_token_hash == token_hash)
    )
    auth_session = result.scalar_one_or_none()

    if not auth_session:
        logger.info("Logout completed: refresh token session not found")
        return

    if auth_session.revoked_at is not None:
        logger.info(
            "Logout completed: session already revoked session_id=%s",
            auth_session.id,
        )
        return

    auth_session.revoked_at = datetime.now(timezone.utc)
    await db.commit()

    logger.info(
        "Logout successful: session_id=%s user_id=%s",
        auth_session.id,
        auth_session.user_id,
    )
