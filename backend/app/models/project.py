from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.language import Language
    from app.models.phrase import Phrase
    from app.models.user import User


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now,
        onupdate=datetime.now,
        server_default=func.now(),
    )
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped[User] = relationship("User", back_populates="projects")

    default_language_id: Mapped[int] = mapped_column(ForeignKey("languages.id"))
    default_language: Mapped[Language] = relationship(
        "Language", back_populates="projects"
    )

    project_languages: Mapped[list[ProjectLanguage]] = relationship(
        "ProjectLanguage",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    phrases: Mapped[list[Phrase]] = relationship(
        "Phrase",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectLanguage(Base):
    __tablename__ = "project_languages"
    __table_args__ = (
        UniqueConstraint(
            "project_id", "language_id", name="uq_project_languages_project_language"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    project: Mapped[Project] = relationship(
        "Project", back_populates="project_languages"
    )
    language_id: Mapped[int] = mapped_column(ForeignKey("languages.id"))
    language: Mapped[Language] = relationship(
        "Language", back_populates="project_languages"
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
