import logging

from app.exceptions.project_exceptions import (
    ProjectAccessDeniedException,
    ProjectNotFoundException,
    ProjectPaginationErrorException,
    ProjectUpdateErrorException,
)
from app.exceptions.phrase_exceptions import (
    InvalidPhraseFileException,
)
from app.models.project import Project
from app.schemas.phrase_schema import PhraseUploadResponse
from app.schemas.project_schema import (
    ProjectCreateRequest,
    ProjectCreateResponse,
    ProjectResponse,
    ProjectUpdateRequest,
)
from app.utils.parsePhraseFiles import (
    keep_supported_columns,
    parse_phrase_file,
)
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)


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

    logger.info(
        "Phrase file accepted: project_id=%s owner_id=%s languages=%s ignored=%s phrases=%s",
        project_id,
        owner_id,
        language_codes,
        unsupported,
        len(rows),
    )
    return PhraseUploadResponse(
        phrase_count=len(rows),
        languages=language_codes,
        unsupported_languages=unsupported,
    )



