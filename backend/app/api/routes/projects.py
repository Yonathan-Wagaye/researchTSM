from app.core.deps import get_current_user, get_supported_language_codes
from app.database import get_db
from app.models.user import User
from app.schemas.phrase_schema import PhraseUploadConfirmResponse, PhraseUploadResponse
from app.schemas.project_schema import (
    ProjectCreateRequest,
    ProjectCreateResponse,
    ProjectResponse,
    ProjectUpdateRequest,
)
from app.services.project_services import (
    add_project,
    confirm_phrase_upload,
    get_paginated_projects,
    get_single_project,
    update_project_details,
    upload_phrases_to_project,
)
from fastapi import APIRouter, Depends, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post(
    "/create",
    response_model=ProjectCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    project: ProjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await add_project(project, current_user.id, db)


@router.get("/getProject", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_single_project(project_id, current_user.id, db)


@router.get("/getProjects", response_model=list[ProjectResponse])
async def get_projects(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_paginated_projects(limit, offset, current_user.id, db)


@router.put("/updateProject", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    updated_project_data: ProjectUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_project_details(
        project_id, current_user.id, updated_project_data, db
    )


@router.post("/uploadPhrases", response_model=PhraseUploadResponse)
async def upload_phrases(
    project_id: int,
    phrase_file: UploadFile,
    current_user: User = Depends(get_current_user),
    supported_language_codes: set[str] = Depends(get_supported_language_codes),
    db: AsyncSession = Depends(get_db),
):
    return await upload_phrases_to_project(
        project_id,
        phrase_file,
        current_user.id,
        supported_language_codes,
        db,
    )


@router.post("/confirmPhraseUpload", response_model=PhraseUploadConfirmResponse)
async def confirm_phrase_upload_route(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await confirm_phrase_upload(project_id, current_user.id, db)
