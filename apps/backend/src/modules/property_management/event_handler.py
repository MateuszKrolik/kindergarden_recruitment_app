from src.modules.property_management.svc import IPropertyManagementSvc

import redis.asyncio as redis
from src.shared.handlers.event_handler import EventHandler
from src.shared.types.modules.compliance.enum import COMPLIANCE_EVENT
from src.shared.types.modules.compliance.event import (
    PropertyChildDocumentApproved,
    PropertyChildDocumentRejected,
    PropertyParentDocumentApproved,
    PropertyParentDocumentRejected,
    PropertyParentPartnerDocumentApproved,
    PropertyParentPartnerDocumentRejected,
)
from src.shared.types.modules.property_management.event import PROPERTY_MANAGEMENT_EVENT
import socketio


class PropertyManagementEventHandler(EventHandler):
    EVENT_MAP = {
        COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_APPROVED: PropertyParentDocumentApproved,
        COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_APPROVED: PropertyChildDocumentApproved,
        COMPLIANCE_EVENT.PROPERTY_PARENT_PARTNER_DOCUMENT_APPROVED: PropertyParentPartnerDocumentApproved,
        COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_REJECTED: PropertyParentDocumentRejected,
        COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_REJECTED: PropertyChildDocumentRejected,
        COMPLIANCE_EVENT.PROPERTY_PARENT_PARTNER_DOCUMENT_REJECTED: PropertyParentPartnerDocumentRejected,
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

    @EventHandler.handle.register  # type: ignore[attr-defined]
    async def _(self, event: PropertyParentDocumentApproved):
        property_children = await self.svc.get_all_property_children_for_given_parent(
            event.property_id,
            event.user_id,
        )
        increment_result = (
            await self.svc.increment_property_children_points_for_given_parent(
                property_id=event.property_id,
                point_value=event.point_value,
                children_ids=[pc.child_id for pc in property_children],
            )
        )
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_UPDATED,
            event.model_dump(mode="json"),
        )
        await self.socket_server.emit(
            PROPERTY_MANAGEMENT_EVENT.PROPERTY_CHILDREN_UPDATED,
            [m.model_dump(mode="json") for m in increment_result],
        )

    @EventHandler.handle.register  # type: ignore[attr-defined]
    async def _(self, event: PropertyParentPartnerDocumentApproved):
        property_children = await self.svc.get_all_property_children_for_given_parent(
            event.property_id,
            event.partner_id,
        )
        increment_result = (
            await self.svc.increment_property_children_points_for_given_parent(
                property_id=event.property_id,
                point_value=event.point_value,
                children_ids=[pc.child_id for pc in property_children],
            )
        )
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_PARENT_PARTNER_DOCUMENT_UPDATED,
            event.model_dump(mode="json"),
        )
        await self.socket_server.emit(
            PROPERTY_MANAGEMENT_EVENT.PROPERTY_CHILDREN_UPDATED,
            [m.model_dump(mode="json") for m in increment_result],
        )

    @EventHandler.handle.register  # type: ignore[attr-defined]
    async def _(self, event: PropertyChildDocumentApproved):
        property_child = await self.svc.get_property_child_by_id(
            event.property_id,
            event.child_id,
        )
        increment_result = (
            await self.svc.increment_property_children_points_for_given_parent(
                property_id=event.property_id,
                point_value=event.point_value,
                children_ids=[property_child.child_id],
            )
        )
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_UPDATED,
            event.model_dump(mode="json"),
        )
        await self.socket_server.emit(
            PROPERTY_MANAGEMENT_EVENT.PROPERTY_CHILDREN_UPDATED,
            [m.model_dump(mode="json") for m in increment_result],
        )

    @EventHandler.handle.register  # type: ignore[attr-defined]
    async def _(self, event: PropertyParentDocumentRejected):
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_UPDATED,
            event.model_dump(mode="json"),
        )
        # TODO: SMTP

    @EventHandler.handle.register  # type: ignore[attr-defined]
    async def _(self, event: PropertyParentPartnerDocumentRejected):
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_PARENT_PARTNER_DOCUMENT_UPDATED,
            event.model_dump(mode="json"),
        )
        # TODO: SMTP

    @EventHandler.handle.register  # type: ignore[attr-defined]
    async def _(self, event: PropertyChildDocumentRejected):
        await self.socket_server.emit(
            COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_UPDATED,
            event.model_dump(mode="json"),
        )
        # TODO: SMTP
