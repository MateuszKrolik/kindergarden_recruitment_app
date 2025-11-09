from functools import wraps
import logging
from typing import Callable, Optional
from aiocache import cached, RedisCache
from aiocache.serializers import PickleSerializer


def redis_cache(
    key_builder: Optional[Callable[..., str]],
    ttl: Optional[int] = None,
    namespace: Optional[str] = None,
):
    def decorator(func):
        @wraps(func)
        @cached(
            cache=RedisCache,
            key_builder=key_builder,
            serializer=PickleSerializer(),
            endpoint="localhost",
            port=6379,
            db=0,
            ttl=ttl,
            namespace=namespace,
        )
        async def wrapper(*args, **kwargs):
            logging.info(f"Cache miss for call: '{func.__name__}'.")
            return await func(*args, **kwargs)

        return wrapper

    return decorator
