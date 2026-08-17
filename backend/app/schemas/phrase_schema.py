from datetime import datetime

from pydantic import BaseModel

from app.models.enums import TranslationStatus


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


class PhraseUploadPreviewRow(BaseModel):
    key: str
    translations: dict[str, str]


class PhraseUploadResponse(BaseModel):
    phrase_count: int
    languages: list[str]
    unsupported_languages: list[str]
    filename: str
    preview: list[PhraseUploadPreviewRow]
    duplicate_keys: list[str]
    empty_key_count: int
    existing_keys: list[str]
    translation_counts: dict[str, int]
    cache_expires_in_seconds: int


class PhraseUploadConfirmResponse(BaseModel):
    phrases_created: int
    translations_created: int
    skipped_empty_keys: int
    skipped_duplicate_keys: int
    skipped_existing_keys: int


class PhraseTranslationCell(BaseModel):
    text: str
    status: TranslationStatus


class PhraseTranslationResponse(BaseModel):
    key: str
    translations: dict[str, PhraseTranslationCell]
    created_at: datetime
    updated_at: datetime


class PhrasesResponse(BaseModel):
    phrases: list[PhraseTranslationResponse]
    total_count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool
