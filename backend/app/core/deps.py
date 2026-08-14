from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.database import get_db
from app.exceptions.auth_exceptions import (
    InvalidAccessTokenException,
)
from app.models.user import User
from app.services.language_services import get_languages

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise InvalidAccessTokenException("Invalid access token")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise InvalidAccessTokenException("Invalid access token")
    return user


async def get_supported_language_codes(
    db: AsyncSession = Depends(get_db),
) -> set[str]:
    languages = await get_languages(db)
    return {language.code.upper() for language in languages}
