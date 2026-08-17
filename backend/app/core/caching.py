from redis import asyncio as aioredis

from app.config import get_settings

settings = get_settings()


async def get_redis_client() -> aioredis.Redis:
    return aioredis.from_url(f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}")


async def set_cache(
    key: str,
    value: str,
    ex: int = 60 * 60 * 24,
    redis_client: aioredis.Redis | None = None,
) -> str:
    client = redis_client or await get_redis_client()
    await client.set(key, value, ex=ex)
    return value


async def get_cache(
    key: str,
    redis_client: aioredis.Redis | None = None,
) -> str | None:
    client = redis_client or await get_redis_client()
    value = await client.get(key)
    if value is None:
        return None
    return value.decode() if isinstance(value, bytes) else value


async def delete_cache(
    key: str,
    redis_client: aioredis.Redis | None = None,
) -> None:
    client = redis_client or await get_redis_client()
    await client.delete(key)


async def delete_cache_by_prefix(
    prefix: str,
    redis_client: aioredis.Redis | None = None,
) -> None:
    client = redis_client or await get_redis_client()
    async for key in client.scan_iter(match=f"{prefix}*"):
        await client.delete(key)
