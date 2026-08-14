from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LanguageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    native_name: str
    direction: str


class ProjectCreateRequest(BaseModel):
    name: str
    description: str | None = None
    default_language_id: int


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    owner_id: int
    default_language: LanguageResponse
    created_at: datetime
    updated_at: datetime


class ProjectCreateResponse(ProjectResponse):
    pass


class ProjectUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    default_language_id: int | None = None
