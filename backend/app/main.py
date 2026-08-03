from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

app = FastAPI(title="TMS API", version="0.1.0")


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
