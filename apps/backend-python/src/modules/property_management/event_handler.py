from logging import getLogger
from abc import ABC, abstractmethod

from src.modules.property_management.client import IReportingClient
from src.modules.property_management.svc import IPropertyManagementSvc

import redis.asyncio as redis
from src.shared.events.modules.compliance import COMPLIANCE_EVENT


class IPropertyManagementEventHandler(ABC):
    @abstractmethod
    async def initialize(self) -> None:
        pass

    @abstractmethod
    async def handle_property_parent_document_request_approved_event(self) -> None:
        pass


class PropertyManagementEventHandler(IPropertyManagementEventHandler):
    def __init__(
        self,
        svc: IPropertyManagementSvc,
        reporting_client: IReportingClient,
        redis_client: redis.Redis,
    ) -> None:
        self.svc = svc
        self.reporting_client = reporting_client
        self.redis_client = redis_client
        self.logger = getLogger(__name__)
        self._initialized = False

    async def initialize(self) -> None:
        if self._initialized:
            return
        await self.handle_property_parent_document_request_approved_event()
        self._initialized = True

    async def handle_property_parent_document_request_approved_event(self):
        pubsub = self.redis_client.pubsub()
        event_name = COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_APPROVED
        await pubsub.subscribe(event_name)
        async for message in pubsub.listen():
            if message["type"] == "message":
                event_data = message["data"]
                self.logger.info(f"Received event '{event_name}': {event_data}")
