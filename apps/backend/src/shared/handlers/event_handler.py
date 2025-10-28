import asyncio
import json
from abc import ABC
from functools import singledispatchmethod
from logging import getLogger
from typing import Any, Dict, Optional

import redis.asyncio as redis
from src.shared.types.event import EventEnvelope
from src.shared.utils.query import try_except


class EventHandler(ABC):
    EVENT_MAP: Dict[str, Any] = {}

    def __init__(self, redis_client: redis.Redis) -> None:
        self.redis_client = redis_client
        self.logger = getLogger(self.__class__.__name__)
        self._initialized = False

    async def initialize(self) -> None:
        if self._initialized:
            return

        for event_name in self.EVENT_MAP.keys():
            asyncio.create_task(self._listen(event_name))

        self._initialized = True

    @singledispatchmethod
    async def handle(self, event: Any):
        return

    async def _listen(self, event_name: str) -> None:
        pubsub = self.redis_client.pubsub()
        await pubsub.subscribe(event_name)

        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            event_type = self._resolve_event(event_name)
            if event_type is None:
                continue
            event_dict = json.loads(message["data"])
            self.logger.info(
                f"Received event '{event_name}':\n{json.dumps(event_dict, indent=2)}"
            )
            envelope = EventEnvelope(**event_dict)
            event = event_type(**envelope.payload)
            _, error = await try_except(self.handle, event)
            if error:
                self.logger.error(
                    f"Error occurred while processing event: '{event_name}'",
                    exc_info=error,
                )

    def _resolve_event(self, event_name: str) -> Optional[Any]:
        return self.EVENT_MAP.get(event_name)
