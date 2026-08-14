import logging

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
from app.models.phrase import Phrase
from app.models.project import Project
from app.schemas.phrase_schema import (
    PhraseCreateRequest,
    PhraseCreateResponse,
    PhraseGetResponse,
    PhraseUpdateRequest,
    PhraseUpdateResponse,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)


async def _get_owned_project(
    project_id: int,
    owner_id: int,
    db: AsyncSession,
) -> Project:
    result = await db.execute(select(Project).where(Project.id == project_id))
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
    return _to_update_response(phrase)


async def get_paginated_phrases(
    project_id: int,
    limit: int,
    offset: int,
    owner_id: int,
    db: AsyncSession,
) -> list[PhraseGetResponse]:
    logger.info(
        "Fetching paginated phrases: project_id=%s owner_id=%s limit=%s offset=%s",
        project_id,
        owner_id,
        limit,
        offset,
    )
    await _get_owned_project(project_id, owner_id, db)

    try:
        result = await db.execute(
            select(Phrase)
            .where(Phrase.project_id == project_id)
            .order_by(Phrase.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    except IntegrityError:
        await db.rollback()
        logger.exception(
            "Error fetching phrases: project_id=%s owner_id=%s limit=%s offset=%s",
            project_id,
            owner_id,
            limit,
            offset,
        )
        raise PhrasePaginationErrorException()

    phrases = list(result.scalars().all())
    logger.info(
        "Fetched paginated phrases: project_id=%s owner_id=%s count=%s",
        project_id,
        owner_id,
        len(phrases),
    )
    return [_to_get_response(phrase) for phrase in phrases]
