from app.models.language import Language
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_languages(db: AsyncSession) -> list[Language]:
    result = await db.execute(select(Language).order_by(Language.name))
    return list(result.scalars().all())
