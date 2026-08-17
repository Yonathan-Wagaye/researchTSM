from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.phrase_schema import (
    PhraseCreateRequest,
    PhraseCreateResponse,
    PhraseGetResponse,
    PhrasesResponse,
    PhraseUpdateRequest,
    PhraseUpdateResponse,
)
from app.services.phrase_services import (
    add_phrase,
    get_paginated_phrase_translations,
    get_single_phrase,
    update_phrase_details,
)
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post(
    "/createPhrase",
    response_model=PhraseCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_phrase(
    phrase: PhraseCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await add_phrase(phrase, current_user.id, db)


@router.put("/updatePhrase", response_model=PhraseUpdateResponse)
async def update_phrase(
    phrase_id: int,
    phrase: PhraseUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_phrase_details(phrase_id, phrase, current_user.id, db)


@router.get("/getPhrase", response_model=PhraseGetResponse)
async def get_phrase(
    phrase_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_single_phrase(phrase_id, current_user.id, db)


@router.get("/getPhraseTranslations", response_model=PhrasesResponse)
async def get_phrases_translations(
    project_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_paginated_phrase_translations(
        project_id, limit, offset, current_user.id, db
    )
