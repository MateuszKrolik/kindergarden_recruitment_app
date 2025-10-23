import asyncio
from typing import List, Set
from uuid import UUID

from src.modules.property_management.client import IReportingClient
from src.modules.property_management.svc import IPropertyManagementSvc

import redis.asyncio as redis
from src.shared.handlers.event_handler import EventHandler
from src.shared.types.modules.compliance.event import COMPLIANCE_EVENT
from src.shared.types.modules.compliance.model import PropertyParentDocument
from src.shared.types.modules.property_management.model import PropertyChild
from src.shared.types.response import HTTPErrorResponse


class PropertyManagementEventHandler(EventHandler):
    EVENT_MAP = {
        COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_APPROVED: PropertyParentDocument
    }

    def __init__(
        self,
        svc: IPropertyManagementSvc,
        reporting_client: IReportingClient,
        redis_client: redis.Redis,
    ) -> None:
        super().__init__(redis_client)
        self.svc = svc
        self.reporting_client = reporting_client

    @EventHandler.handle.register
    async def _(self, event: PropertyParentDocument):
        (
            document_type,
            error,
        ) = await self.reporting_client.get_parent_document_type_by_document_id(
            parent_document_id=event.parent_document_id
        )
        if error:
            self.logger.error(error)
            return
        assert document_type is not None
        tasks = await asyncio.gather(
            self.svc.get_point_value_for_given_property_parent_document_by_document_type(
                event.property_id,
                document_type,
            ),
            self.svc.get_all_property_children_for_given_parent(
                event.property_id,
                event.user_id,
            ),
        )
        points_task: HTTPErrorResponse[int] = tasks[0]
        points, error = points_task
        if error:
            self.logger.error(error)
            return
        assert points is not None
        property_children_task: HTTPErrorResponse[List[PropertyChild]] = tasks[1]
        property_children, error = property_children_task
        if error:
            self.logger.error(error)
            return
        assert property_children is not None
        children_ids: Set[UUID] = set(pc.child_id for pc in property_children)
        (
            _,
            error,
        ) = await self.svc.increment_property_children_points_for_given_parent(
            property_id=event.property_id,
            point_value=points,
            children_ids=children_ids,
        )
        if error:
            self.logger.error(error)
            return
        # TODO: socket event: COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED
        # TODO: socket event: PROPERTY_MANAGEMENT_EVENTS.PROPERTY_CHILDREN_UPDATED
