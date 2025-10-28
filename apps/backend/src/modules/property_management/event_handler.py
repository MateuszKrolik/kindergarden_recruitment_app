import asyncio

from src.modules.property_management.svc import IPropertyManagementSvc

import redis.asyncio as redis
from src.shared.handlers.event_handler import EventHandler
from src.shared.types.modules.compliance.event import COMPLIANCE_EVENT
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
)
from src.shared.types.modules.property_management.event import PROPERTY_MANAGEMENT_EVENT
import socketio


class PropertyManagementEventHandler(EventHandler):
    EVENT_MAP = {
        COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_APPROVED: PropertyParentDocument,
        COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_APPROVED: PropertyChildDocument,
    }

    def __init__(
        self,
        svc: IPropertyManagementSvc,
        redis_client: redis.Redis,
        socket_server: socketio.AsyncServer,
    ) -> None:
        super().__init__(redis_client)
        self.svc = svc
        self.socket_server = socket_server

    @EventHandler.handle.register
    async def _(self, event: PropertyParentDocument):
        async with asyncio.TaskGroup() as tg:
            points_task = tg.create_task(
                self.svc.get_point_value_for_given_property_parent_document_by_document_type(
                    event.property_id,
                    event.document_type,
                )
            )
            property_children_task = tg.create_task(
                self.svc.get_all_property_children_for_given_parent(
                    event.property_id,
                    event.user_id,
                )
            )
        points = points_task.result()
        property_children = property_children_task.result()
        children_ids = set(pc.child_id for pc in property_children)
        increment_result = (
            await self.svc.increment_property_children_points_for_given_parent(
                property_id=event.property_id,
                point_value=points,
                children_ids=children_ids,
            )
        )
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_APPROVED,
            event.model_dump(mode="json"),
        )
        await self.socket_server.emit(
            PROPERTY_MANAGEMENT_EVENT.PROPERTY_CHILDREN_UPDATED,
            [m.model_dump(mode="json") for m in increment_result],
        )

    @EventHandler.handle.register
    async def _(self, event: PropertyChildDocument):
        async with asyncio.TaskGroup() as tg:
            points_task = tg.create_task(
                self.svc.get_point_value_for_given_property_child_document_by_document_type(
                    event.property_id,
                    event.document_type,
                )
            )
            property_child_task = tg.create_task(
                self.svc.get_property_child_by_id(
                    event.property_id,
                    event.child_id,
                )
            )
        points = points_task.result()
        property_child = property_child_task.result()
        increment_result = (
            await self.svc.increment_property_children_points_for_given_parent(
                property_id=event.property_id,
                point_value=points,
                children_ids=[property_child.child_id],
            )
        )
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_APPROVED,
            event.model_dump(mode="json"),
        )
        await self.socket_server.emit(
            PROPERTY_MANAGEMENT_EVENT.PROPERTY_CHILDREN_UPDATED,
            [m.model_dump(mode="json") for m in increment_result],
        )
