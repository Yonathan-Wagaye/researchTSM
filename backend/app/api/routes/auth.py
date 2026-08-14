from app.config import get_settings
from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserLogin, UserRegister, UserResponse
from app.services.auth_services import (
    authenticate_user,
    logout_auth_session,
    refresh_auth_session,
    register_user,
)
from fastapi import APIRouter, Cookie, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()
settings = get_settings()


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path="/auth",
        domain=settings.COOKIE_DOMAIN,
        samesite="lax",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key="refresh_token",
        path="/auth",
        domain=settings.COOKIE_DOMAIN,
        secure=settings.ENVIRONMENT == "production",
        httponly=True,
        samesite="lax",
    )


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    user: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    return await register_user(user, db)


@router.post("/login")
async def login(
    request: Request,
    response: Response,
    user: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")
    tokens = await authenticate_user(ip_address, user_agent, user, db)
    _set_refresh_cookie(response, tokens["refresh_token"])

    return {
        "access_token": tokens["access_token"],
        "token_type": "Bearer",
    }


@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    tokens = await refresh_auth_session(refresh_token, db)
    _set_refresh_cookie(response, tokens["refresh_token"])

    return {
        "access_token": tokens["access_token"],
        "token_type": "Bearer",
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    await logout_auth_session(refresh_token, db)
    _clear_refresh_cookie(response)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )
