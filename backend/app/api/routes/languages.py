from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.project_schema import LanguageResponse
from app.services.language_services import get_languages
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("", response_model=list[LanguageResponse])
async def list_languages(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_languages(db)
