from datetime import datetime

from pydantic import BaseModel


class PhraseCreateRequest(BaseModel):
    project_id: int
    key: str
    source_text: str
    context: str | None = None
    usage: str | None = None


class PhraseCreateResponse(BaseModel):
    id: int
    project_id: int
    key: str
    source_text: str
    context: str | None = None
    usage: str | None = None
    created_at: datetime
    updated_at: datetime


class PhraseUpdateRequest(BaseModel):
    key: str | None = None
    source_text: str | None = None
    context: str | None = None
    usage: str | None = None


class PhraseUpdateResponse(BaseModel):
    id: int
    project_id: int
    key: str
    source_text: str
    context: str | None = None
    usage: str | None = None
    created_at: datetime
    updated_at: datetime


class PhraseGetResponse(BaseModel):
    id: int
    project_id: int
    key: str
    source_text: str
    context: str | None = None
    usage: str | None = None
    created_at: datetime
    updated_at: datetime


class PhraseUploadResponse(BaseModel):
    phrase_count: int
    languages: list[str]
    unsupported_languages: list[str]
