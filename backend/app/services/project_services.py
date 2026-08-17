import json
import logging

from app.core.caching import delete_cache, get_cache, set_cache
from app.exceptions.phrase_exceptions import (
    InvalidPhraseFileException,
    PhraseUploadNotFoundException,
)
from app.exceptions.project_exceptions import (
    ProjectAccessDeniedException,
    ProjectNotFoundException,
    ProjectPaginationErrorException,
    ProjectUpdateErrorException,
)
from app.models.language import Language
from app.models.phrase import Phrase
from app.models.project import Project
from app.models.translation import Translation
from app.schemas.phrase_schema import (
    PhraseUploadConfirmResponse,
    PhraseUploadPreviewRow,
    PhraseUploadResponse,
)
from app.schemas.project_schema import (
    ProjectCreateRequest,
    ProjectCreateResponse,
    ProjectResponse,
    ProjectUpdateRequest,
)
from app.utils.parsePhraseFiles import (
    analyze_phrase_rows,
    extract_language_codes,
    get_row_key,
    get_row_translation,
    keep_supported_columns,
    parse_phrase_file,
)
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

PHRASE_UPLOAD_CACHE_TTL_SECONDS = 60 * 60 * 24
PHRASE_UPLOAD_PREVIEW_LIMIT = 5


def _phrase_upload_cache_key(project_id: int) -> str:
    return f"project_{project_id}_phrases"


async def _load_project_with_language(
    project_id: int,
    db: AsyncSession,
) -> Project:
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.default_language))
        .where(Project.id == project_id)
        .execution_options(populate_existing=True)
    )
    return result.scalar_one()


def _to_project_response(project: Project) -> ProjectResponse:
    return ProjectResponse.model_validate(project)


async def add_project(
    project: ProjectCreateRequest,
    owner_id: int,
    db: AsyncSession,
) -> ProjectCreateResponse:
    logger.info(
        "Creating project: owner_id=%s name=%s default_language_id=%s",
        owner_id,
        project.name,
        project.default_language_id,
    )
    new_project = Project(
        name=project.name,
        description=project.description,
        owner_id=owner_id,
        default_language_id=project.default_language_id,
    )
    db.add(new_project)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        logger.exception(
            "Project creation failed (integrity error): owner_id=%s name=%s default_language_id=%s",
            owner_id,
            project.name,
            project.default_language_id,
        )
        raise

    new_project = await _load_project_with_language(new_project.id, db)
    logger.info(
        "Project created successfully: project_id=%s owner_id=%s",
        new_project.id,
        owner_id,
    )
    return ProjectCreateResponse.model_validate(new_project)


async def get_single_project(
    project_id: int,
    owner_id: int,
    db: AsyncSession,
) -> ProjectResponse:
    logger.info(
        "Fetching project: project_id=%s requester_id=%s",
        project_id,
        owner_id,
    )
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.default_language))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        logger.warning(
            "Project not found: project_id=%s requester_id=%s",
            project_id,
            owner_id,
        )
        raise ProjectNotFoundException()
    if project.owner_id != owner_id:
        logger.warning(
            "Project access denied: project_id=%s owner_id=%s requester_id=%s",
            project_id,
            project.owner_id,
            owner_id,
        )
        raise ProjectAccessDeniedException()

    logger.info(
        "Project fetched successfully: project_id=%s requester_id=%s",
        project_id,
        owner_id,
    )
    return _to_project_response(project)


async def get_paginated_projects(
    limit: int,
    offset: int,
    owner_id: int,
    db: AsyncSession,
) -> list[ProjectResponse]:
    logger.info(
        "Fetching paginated projects: owner_id=%s limit=%s offset=%s",
        owner_id,
        limit,
        offset,
    )
    try:
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.default_language))
            .where(Project.owner_id == owner_id)
            .order_by(Project.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    except IntegrityError:
        await db.rollback()
        logger.exception(
            "Error fetching projects: owner_id=%s limit=%s offset=%s",
            owner_id,
            limit,
            offset,
        )
        raise ProjectPaginationErrorException()

    projects = list(result.scalars().all())
    logger.info(
        "Fetched paginated projects: owner_id=%s count=%s",
        owner_id,
        len(projects),
    )
    return [_to_project_response(project) for project in projects]


async def update_project_details(
    project_id: int,
    owner_id: int,
    project_data: ProjectUpdateRequest,
    db: AsyncSession,
) -> ProjectResponse:
    logger.info(
        "Updating project details: project_id=%s owner_id=%s updates=%s",
        project_id,
        owner_id,
        project_data.model_dump(exclude_unset=True),
    )
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.default_language))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        logger.warning(
            "Project not found: project_id=%s owner_id=%s",
            project_id,
            owner_id,
        )
        raise ProjectNotFoundException()
    if project.owner_id != owner_id:
        logger.warning(
            "Project access denied: project_id=%s owner_id=%s requester_id=%s",
            project_id,
            project.owner_id,
            owner_id,
        )
        raise ProjectAccessDeniedException()

    updates = project_data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(project, key, value)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ProjectUpdateErrorException()

    project = await _load_project_with_language(project.id, db)
    logger.info(
        "Project details updated successfully: project_id=%s owner_id=%s",
        project_id,
        owner_id,
    )
    return _to_project_response(project)


async def upload_phrases_to_project(
    project_id: int,
    phrase_file: UploadFile,
    owner_id: int,
    supported_language_codes: set[str],
    db: AsyncSession,
) -> PhraseUploadResponse:
    await get_single_project(project_id, owner_id, db)

    filename = phrase_file.filename or ""
    content = await phrase_file.read()
    try:
        rows = parse_phrase_file(filename, content)
    except ValueError as error:
        raise InvalidPhraseFileException(str(error)) from error

    if not rows:
        raise InvalidPhraseFileException("The file has no phrases")

    rows, language_codes, unsupported = keep_supported_columns(
        rows,
        supported_language_codes,
    )
    if not language_codes:
        raise InvalidPhraseFileException(
            "The file has no languages supported by the platform"
        )

    preview_rows, duplicate_keys, empty_key_count, translation_counts = (
        analyze_phrase_rows(
            rows,
            language_codes,
            preview_limit=PHRASE_UPLOAD_PREVIEW_LIMIT,
        )
    )

    upload_keys = {get_row_key(row) for row in rows if get_row_key(row)}
    existing_keys: list[str] = []
    if upload_keys:
        existing_result = await db.execute(
            select(Phrase.key).where(
                Phrase.project_id == project_id,
                Phrase.key.in_(upload_keys),
            )
        )
        existing_keys = sorted(existing_result.scalars().all())

    logger.info(
        "Phrase file accepted: project_id=%s owner_id=%s languages=%s ignored=%s phrases=%s duplicates=%s existing=%s empty_keys=%s",
        project_id,
        owner_id,
        language_codes,
        unsupported,
        len(rows),
        duplicate_keys,
        existing_keys,
        empty_key_count,
    )
    await set_cache(
        _phrase_upload_cache_key(project_id),
        json.dumps(rows),
        ex=PHRASE_UPLOAD_CACHE_TTL_SECONDS,
    )
    return PhraseUploadResponse(
        phrase_count=len(rows),
        languages=language_codes,
        unsupported_languages=unsupported,
        filename=filename,
        preview=[PhraseUploadPreviewRow.model_validate(row) for row in preview_rows],
        duplicate_keys=duplicate_keys,
        empty_key_count=empty_key_count,
        existing_keys=existing_keys,
        translation_counts=translation_counts,
        cache_expires_in_seconds=PHRASE_UPLOAD_CACHE_TTL_SECONDS,
    )


async def confirm_phrase_upload(
    project_id: int,
    owner_id: int,
    db: AsyncSession,
) -> PhraseUploadConfirmResponse:
    await get_single_project(project_id, owner_id, db)
    project = await _load_project_with_language(project_id, db)

    cached_rows = await get_cache(_phrase_upload_cache_key(project_id))
    if not cached_rows:
        raise PhraseUploadNotFoundException()

    rows = json.loads(cached_rows)
    if not rows:
        raise PhraseUploadNotFoundException()

    language_codes = extract_language_codes(list(rows[0].keys()))
    default_language_code = project.default_language.code.upper()

    existing_result = await db.execute(
        select(Phrase.key).where(Phrase.project_id == project_id)
    )
    existing_keys = set(existing_result.scalars().all())

    languages_result = await db.execute(select(Language))
    language_by_code = {
        language.code.upper(): language for language in languages_result.scalars().all()
    }

    seen_keys: set[str] = set()
    skipped_empty_keys = 0
    skipped_duplicate_keys = 0
    skipped_existing_keys = 0
    phrases_created = 0
    translations_created = 0

    for row in rows:
        key = get_row_key(row)
        if not key:
            skipped_empty_keys += 1
            continue
        if key in seen_keys:
            skipped_duplicate_keys += 1
            continue
        if key in existing_keys:
            skipped_existing_keys += 1
            continue

        source_text = get_row_translation(row, default_language_code)
        if not source_text:
            for code in language_codes:
                source_text = get_row_translation(row, code)
                if source_text:
                    break
        if not source_text:
            skipped_empty_keys += 1
            continue

        seen_keys.add(key)
        phrase = Phrase(
            project_id=project_id,
            key=key,
            source_text=source_text,
        )
        db.add(phrase)
        await db.flush()

        for code in language_codes:
            if code == default_language_code:
                continue
            text = get_row_translation(row, code)
            if not text:
                continue
            language = language_by_code.get(code)
            if language is None:
                continue
            db.add(
                Translation(
                    phrase_id=phrase.id,
                    target_language_id=language.id,
                    text=text,
                )
            )
            translations_created += 1

        phrases_created += 1

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        logger.exception(
            "Phrase upload confirmation failed: project_id=%s owner_id=%s",
            project_id,
            owner_id,
        )
        raise

    await delete_cache(_phrase_upload_cache_key(project_id))
    logger.info(
        "Phrase upload confirmed: project_id=%s owner_id=%s phrases=%s translations=%s",
        project_id,
        owner_id,
        phrases_created,
        translations_created,
    )
    return PhraseUploadConfirmResponse(
        phrases_created=phrases_created,
        translations_created=translations_created,
        skipped_empty_keys=skipped_empty_keys,
        skipped_duplicate_keys=skipped_duplicate_keys,
        skipped_existing_keys=skipped_existing_keys,
    )
