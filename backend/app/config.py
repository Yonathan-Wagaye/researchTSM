import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "TMS API"
    ENVIRONMENT: Literal["development", "test", "production"] = "development"
    DATABASE_URL: str | None = None
    TEST_DATABASE_URL: str | None = None
    PRODUCTION_DATABASE_URL: str | None = None
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 7 * 24 * 60  # 7 days
    LOG_LEVEL: str = "INFO"
    COOKIE_DOMAIN: str | None = None
    FRONTEND_URL: str | None = "http://localhost:3000"

    @property
    def active_database_url(self) -> str:
        if self.ENVIRONMENT == "development" and self.DATABASE_URL:
            return self.DATABASE_URL

        if self.ENVIRONMENT == "test" and self.TEST_DATABASE_URL:
            return self.TEST_DATABASE_URL.strip()

        if self.ENVIRONMENT == "production" and self.PRODUCTION_DATABASE_URL:
            return self.PRODUCTION_DATABASE_URL.strip()

        raise ValueError(
            f"No database URL configured for the {self.ENVIRONMENT} environment"
        )


@lru_cache
def get_settings() -> Settings:
    environment = os.getenv("ENVIRONMENT", "development")
    env_filename = ".env.test" if environment == "test" else ".env"
    env_file = Path(__file__).resolve().parents[2] / env_filename

    return Settings(_env_file=env_file if env_file.exists() else None)
