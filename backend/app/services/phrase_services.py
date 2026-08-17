import logging
from math import ceil

from app.core.caching import delete_cache_by_prefix, get_cache, set_cache
from app.exceptions.phrase_exceptions import (
    PhraseAccessDeniedException,
    PhraseAlreadyExistsException,
    PhraseNotFoundException,
    PhrasePaginationErrorException,
)
from app.exceptions.project_exceptions import (
    ProjectAccessDeniedException,
    ProjectNotFoundException,
)
from app.models.enums import TranslationStatus
from app.models.phrase import Phrase
from app.models.project import Project
from app.models.translation import Translation
from app.schemas.phrase_schema import (
    PhraseCreateRequest,
    PhraseCreateResponse,
    PhraseGetResponse,
    PhrasesResponse,
    PhraseTranslationCell,
    PhraseTranslationResponse,
    PhraseUpdateRequest,
    PhraseUpdateResponse,
)
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

PHRASE_LIST_CACHE_TTL_SECONDS = 60 * 60 * 24


def _phrase_list_cache_key(project_id: int, offset: int, limit: int) -> str:
    return f"phrases:{project_id}:{offset}:{limit}"


async def invalidate_phrase_list_cache(project_id: int) -> None:
    await delete_cache_by_prefix(f"phrases:{project_id}:")


async def _get_owned_project(
    project_id: int,
    owner_id: int,
    db: AsyncSession,
) -> Project:
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.default_language))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        raise ProjectNotFoundException()
    if project.owner_id != owner_id:
        raise ProjectAccessDeniedException()
    return project


async def _get_owned_phrase(
    phrase_id: int,
    owner_id: int,
    db: AsyncSession,
) -> Phrase:
    result = await db.execute(
        select(Phrase)
        .options(selectinload(Phrase.project))
        .where(Phrase.id == phrase_id)
    )
    phrase = result.scalar_one_or_none()
    if phrase is None:
        logger.warning(
            "Phrase not found: phrase_id=%s requester_id=%s",
            phrase_id,
            owner_id,
        )
        raise PhraseNotFoundException()
    if phrase.project.owner_id != owner_id:
        logger.warning(
            "Phrase access denied: phrase_id=%s owner_id=%s requester_id=%s",
            phrase_id,
            phrase.project.owner_id,
            owner_id,
        )
        raise PhraseAccessDeniedException()
    return phrase


def _to_create_response(phrase: Phrase) -> PhraseCreateResponse:
    return PhraseCreateResponse(
        id=phrase.id,
        project_id=phrase.project_id,
        key=phrase.key,
        source_text=phrase.source_text,
        context=phrase.context,
        usage=phrase.usage,
        created_at=phrase.created_at,
        updated_at=phrase.updated_at,
    )


def _to_get_response(phrase: Phrase) -> PhraseGetResponse:
    return PhraseGetResponse(
        id=phrase.id,
        project_id=phrase.project_id,
        key=phrase.key,
        source_text=phrase.source_text,
        context=phrase.context,
        usage=phrase.usage,
        created_at=phrase.created_at,
        updated_at=phrase.updated_at,
    )


def _to_update_response(phrase: Phrase) -> PhraseUpdateResponse:
    return PhraseUpdateResponse(
        id=phrase.id,
        project_id=phrase.project_id,
        key=phrase.key,
        source_text=phrase.source_text,
        context=phrase.context,
        usage=phrase.usage,
        created_at=phrase.created_at,
        updated_at=phrase.updated_at,
    )


def _to_translation_response(
    phrase: Phrase,
    default_language_code: str,
) -> PhraseTranslationResponse:
    translations = {
        default_language_code: PhraseTranslationCell(
            text=phrase.source_text,
            status=TranslationStatus.APPROVED,
        ),
    }
    for translation in phrase.translations:
        translations[translation.target_language.code.upper()] = PhraseTranslationCell(
            text=translation.text,
            status=translation.status,
        )
    return PhraseTranslationResponse(
        key=phrase.key,
        translations=translations,
        created_at=phrase.created_at,
        updated_at=phrase.updated_at,
    )


async def add_phrase(
    phrase: PhraseCreateRequest,
    owner_id: int,
    db: AsyncSession,
) -> PhraseCreateResponse:
    logger.info(
        "Creating phrase: owner_id=%s project_id=%s key=%s",
        owner_id,
        phrase.project_id,
        phrase.key,
    )
    await _get_owned_project(phrase.project_id, owner_id, db)

    new_phrase = Phrase(
        project_id=phrase.project_id,
        key=phrase.key,
        source_text=phrase.source_text,
        context=phrase.context,
        usage=phrase.usage,
    )
    db.add(new_phrase)

    try:
        await db.commit()
        await db.refresh(new_phrase)
    except IntegrityError:
        await db.rollback()
        logger.warning(
            "Phrase creation failed (duplicate key): owner_id=%s project_id=%s key=%s",
            owner_id,
            phrase.project_id,
            phrase.key,
        )
        raise PhraseAlreadyExistsException()

    logger.info(
        "Phrase created successfully: phrase_id=%s project_id=%s owner_id=%s",
        new_phrase.id,
        new_phrase.project_id,
        owner_id,
    )
    await invalidate_phrase_list_cache(new_phrase.project_id)
    return _to_create_response(new_phrase)


async def get_single_phrase(
    phrase_id: int,
    owner_id: int,
    db: AsyncSession,
) -> PhraseGetResponse:
    logger.info(
        "Fetching phrase: phrase_id=%s requester_id=%s",
        phrase_id,
        owner_id,
    )
    phrase = await _get_owned_phrase(phrase_id, owner_id, db)
    logger.info(
        "Phrase fetched successfully: phrase_id=%s requester_id=%s",
        phrase_id,
        owner_id,
    )
    return _to_get_response(phrase)


async def update_phrase_details(
    phrase_id: int,
    phrase_data: PhraseUpdateRequest,
    owner_id: int,
    db: AsyncSession,
) -> PhraseUpdateResponse:
    logger.info(
        "Updating phrase details: phrase_id=%s owner_id=%s updates=%s",
        phrase_id,
        owner_id,
        phrase_data.model_dump(exclude_unset=True),
    )
    phrase = await _get_owned_phrase(phrase_id, owner_id, db)

    updates = phrase_data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(phrase, key, value)

    try:
        await db.commit()
        await db.refresh(phrase)
    except IntegrityError:
        await db.rollback()
        logger.warning(
            "Phrase update failed (integrity error): phrase_id=%s owner_id=%s",
            phrase_id,
            owner_id,
        )
        raise PhraseAlreadyExistsException()

    logger.info(
        "Phrase details updated successfully: phrase_id=%s owner_id=%s",
        phrase_id,
        owner_id,
    )
    await invalidate_phrase_list_cache(phrase.project_id)
    return _to_update_response(phrase)


async def get_paginated_phrase_translations(
    project_id: int,
    limit: int,
    offset: int,
    owner_id: int,
    db: AsyncSession,
) -> PhrasesResponse:
    logger.info(
        "Fetching paginated phrase translations: project_id=%s limit=%s offset=%s owner_id=%s",
        project_id,
        limit,
        offset,
        owner_id,
    )
    project = await _get_owned_project(project_id, owner_id, db)
    default_language_code = project.default_language.code.upper()
    cache_key = _phrase_list_cache_key(project_id, offset, limit)

    cached_result = await get_cache(cache_key)
    if cached_result:
        logger.info(
            "Phrase translations cache hit: project_id=%s offset=%s limit=%s",
            project_id,
            offset,
            limit,
        )
        return PhrasesResponse.model_validate_json(cached_result)

    try:
        total_count = await db.scalar(
            select(func.count())
            .select_from(Phrase)
            .where(Phrase.project_id == project_id)
        )
        result = await db.execute(
            select(Phrase)
            .options(
                selectinload(Phrase.translations).selectinload(
                    Translation.target_language
                )
            )
            .where(Phrase.project_id == project_id)
            .order_by(Phrase.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    except IntegrityError:
        await db.rollback()
        logger.exception(
            "Error fetching phrase translations: project_id=%s owner_id=%s limit=%s offset=%s",
            project_id,
            owner_id,
            limit,
            offset,
        )
        raise PhrasePaginationErrorException()

    phrases = list(result.scalars().all())
    total_count = total_count or 0
    page = (offset // limit) + 1
    total_pages = ceil(total_count / limit) if total_count else 0

    logger.info(
        "Fetched paginated phrase translations: project_id=%s owner_id=%s count=%s total=%s",
        project_id,
        owner_id,
        len(phrases),
        total_count,
    )
    response = PhrasesResponse(
        phrases=[
            _to_translation_response(phrase, default_language_code)
            for phrase in phrases
        ],
        total_count=total_count,
        page=page,
        page_size=limit,
        total_pages=total_pages,
        has_next=offset + limit < total_count,
        has_previous=offset > 0,
    )
    await set_cache(
        cache_key,
        response.model_dump_json(),
        ex=PHRASE_LIST_CACHE_TTL_SECONDS,
    )
    return response
