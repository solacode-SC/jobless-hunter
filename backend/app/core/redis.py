"""Async Redis client and cache helpers."""

from __future__ import annotations

import json
import logging
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

redis_client: aioredis.Redis | None = None


async def init_redis() -> aioredis.Redis:
    """Initialise and return the global Redis client."""
    global redis_client
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        max_connections=20,
    )
    # Verify connectivity
    try:
        await redis_client.ping()
        logger.info("Redis connected at %s", settings.REDIS_URL)
    except Exception:
        logger.warning("Redis is not available – caching disabled")
        redis_client = None
    return redis_client


async def close_redis() -> None:
    """Gracefully close the Redis connection."""
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None
        logger.info("Redis connection closed")


def get_redis() -> aioredis.Redis | None:
    """Return the current Redis client (may be None if unavailable)."""
    return redis_client


# ── Cache helpers ────────────────────────────────────────────────────────────


async def cache_get(key: str) -> Any | None:
    """Get a value from cache, returning None on miss or error."""
    if redis_client is None:
        return None
    try:
        raw = await redis_client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as exc:
        logger.warning("Cache GET error for %s: %s", key, exc)
        return None


async def cache_set(
    key: str,
    value: Any,
    ttl: int | None = None,
) -> bool:
    """Store a value in cache. Returns True on success."""
    if redis_client is None:
        return False
    try:
        serialised = json.dumps(value, default=str)
        await redis_client.set(key, serialised, ex=ttl or settings.REDIS_CACHE_TTL)
        return True
    except Exception as exc:
        logger.warning("Cache SET error for %s: %s", key, exc)
        return False


async def cache_delete(key: str) -> bool:
    """Delete a cache key. Returns True if deleted."""
    if redis_client is None:
        return False
    try:
        await redis_client.delete(key)
        return True
    except Exception as exc:
        logger.warning("Cache DELETE error for %s: %s", key, exc)
        return False


async def cache_clear_pattern(pattern: str) -> int:
    """Delete all keys matching a glob pattern. Returns count deleted."""
    if redis_client is None:
        return 0
    try:
        count = 0
        async for key in redis_client.scan_iter(match=pattern, count=100):
            await redis_client.delete(key)
            count += 1
        return count
    except Exception as exc:
        logger.warning("Cache CLEAR error for pattern %s: %s", pattern, exc)
        return 0
