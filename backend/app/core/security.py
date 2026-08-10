import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.config import get_settings

settings = get_settings()


def hash_password(password: str) -> str:
    return PasswordHash.recommended().hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return PasswordHash.recommended().verify(password, hashed_password)


def create_access_token(user_id: int) -> str:
    current_time = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": current_time,
        "exp": current_time + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }

    return jwt.encode(
        payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
