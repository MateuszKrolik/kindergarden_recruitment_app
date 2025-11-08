from typing import Callable, Optional
from aiocache import cached, RedisCache
from aiocache.serializers import PickleSerializer


def cached_redis(
    key_builder: Callable[..., str],
    ttl: Optional[int] = None,
    namespace: Optional[str] = None,
):
    def decorator(func):
        return cached(
            cache=RedisCache,
            key_builder=key_builder,
            serializer=PickleSerializer(),
            endpoint="localhost",
            port=6379,
            db=0,
            ttl=ttl,
            namespace=namespace,
        )(func)

    return decorator
