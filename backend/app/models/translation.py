from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import TranslationStatus

if TYPE_CHECKING:
    from app.models.language import Language
    from app.models.phrase import Phrase


class Translation(Base):
    __tablename__ = "translations"
    __table_args__ = (
        UniqueConstraint(
            "phrase_id",
            "target_language_id",
            name="uq_translations_phrase_language",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[TranslationStatus] = mapped_column(
        Enum(
            TranslationStatus,
            name="translation_status",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=TranslationStatus.PENDING,
    )
    phrase_id: Mapped[int] = mapped_column(ForeignKey("phrases.id"))
    phrase: Mapped[Phrase] = relationship("Phrase", back_populates="translations")
    target_language_id: Mapped[int] = mapped_column(ForeignKey("languages.id"))
    target_language: Mapped[Language] = relationship(
        "Language", back_populates="translations"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now,
        onupdate=datetime.now,
        server_default=func.now(),
    )
