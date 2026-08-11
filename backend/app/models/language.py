from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import TextDirection

if TYPE_CHECKING:
    from app.models.project import Project, ProjectLanguage
    from app.models.translation import Translation


class Language(Base):
    __tablename__ = "languages"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    native_name: Mapped[str] = mapped_column(String(255), nullable=False)
    direction: Mapped[TextDirection] = mapped_column(
        Enum(
            TextDirection,
            name="text_direction",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=TextDirection.LTR,
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

    projects: Mapped[list[Project]] = relationship(
        "Project", back_populates="default_language"
    )
    project_languages: Mapped[list[ProjectLanguage]] = relationship(
        "ProjectLanguage", back_populates="language"
    )
    translations: Mapped[list[Translation]] = relationship(
        "Translation", back_populates="target_language"
    )
