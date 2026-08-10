import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.auth import router as auth_router
from app.config import get_settings
from app.database import get_db
from app.exceptions.base import TSMException
from app.exceptions.handlers import tsm_expception_handler, unexpected_exception_handler

settings = get_settings()
logging.basicConfig(
    level=settings.LOG_LEVEL.upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logging.getLogger().setLevel(settings.LOG_LEVEL.upper())
logger = logging.getLogger(__name__)

app = FastAPI(title="TMS API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(TSMException, tsm_expception_handler)
app.add_exception_handler(Exception, unexpected_exception_handler)
app.include_router(auth_router, prefix="/auth")

logger.info("Application configured for %s", settings.ENVIRONMENT)


@app.get("/")
async def root():
    return {"message": "TSM API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/health/database")
async def database_health_check(
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    await db.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "connected",
    }
