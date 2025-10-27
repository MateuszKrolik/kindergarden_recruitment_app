import json
from logging import getLogger
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from src.modules.compliance.client import IIdentityClient
from src.modules.compliance.repo import IComplianceRepo
from src.shared.types.event import T, EventEnvelope
from src.shared.types.modules.compliance.event import COMPLIANCE_EVENT
from src.shared.types.modules.compliance.enum import REQUEST_STATUS
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
    PropertyParentPartnerDocument,
)
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPError, HTTPErrorResponse
import redis.asyncio as redis
from src.shared.utils.event import create_event
import socketio
from src.shared.utils.query import try_except


class IComplianceSvc(ABC):
    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyChildDocument]]:
        pass

    @abstractmethod
    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_doc_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyParentDocument]]:
        pass

    @abstractmethod
    async def send_property_parent_document_approval_request(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def set_property_parent_document_request_status(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def get_all_child_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyChildDocument]]:
        pass

    @abstractmethod
    async def send_property_child_document_approval_request(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        pass

    @abstractmethod
    async def get_property_child_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        pass

    @abstractmethod
    async def set_property_child_document_request_status(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        pass

    @abstractmethod
    async def send_property_parent_partner_document_approval_request(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentPartnerDocument]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent_partner(
        self,
        property_id: UUID,
        partner_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyParentPartnerDocument]]:
        pass

    @abstractmethod
    async def get_property_parent_partner_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentPartnerDocument]:
        pass


class ComplianceSvc(IComplianceSvc):
    def __init__(
        self,
        repo: IComplianceRepo,
        identity_client: IIdentityClient,
        redis_client: redis.Redis,
        socket_server: socketio.AsyncServer,
    ) -> None:
        self.repo = repo
        self.identity_client = identity_client
        self.redis_client = redis_client
        self.logger = getLogger(__name__)
        self.socket_server = socket_server

    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        return await self.repo.get_all_document_approval_requests_for_given_property_parent(
            property_id=property_id, user_id=user_id
        )

    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyChildDocument]]:
        return (
            await self.repo.get_all_document_approval_requests_for_given_property_child(
                property_id=property_id, child_id=child_id
            )
        )

    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_doc_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        return await self.repo.get_property_parent_document_approval_request_by_document_id(
            property_id=property_id, user_id=user_id, parent_doc_id=parent_doc_id
        )

    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyParentDocument]]:
        return await self.repo.get_all_document_approval_requests_for_given_property(
            property_id=property_id,
            page_size=page_size,
            page_number=page_number,
        )

    async def send_property_parent_document_approval_request(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        data, error = await self.repo.send_property_parent_document_approval_request(
            property_id=property_id,
            user_id=user_id,
            parent_document_id=parent_document_id,
            document_type=document_type,
        )
        if error:
            return None, error
        _, socket_error = await try_except(
            self.socket_server.emit,
            COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_REQUESTED,
            data.model_dump(mode="json"),
        )
        if socket_error:
            self.logger.error(socket_error)
        return data, None

    async def set_property_parent_document_request_status(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        is_admin, error = await self.identity_client.is_property_admin(
            property_id=property_id, user_id=admin_id
        )
        if error:
            return None, error
        if not is_admin:
            return None, HTTPError(
                code=403, message="Insufficient permissions - required role: 'admin'!"
            )
        data, error = await self.repo.set_property_parent_document_request_status(
            property_id,
            user_id,
            parent_document_id,
            request_status,
            admin_id,
        )
        if error:
            return None, error
        assert data is not None
        event = create_event(
            type=COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_APPROVED,
            source=__name__,
            version="1.0",
            payload=data,
        )
        if error := await self._publish_event(event):
            return None, error
        return data, None

    async def get_all_child_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyChildDocument]]:
        return (
            await self.repo.get_all_child_document_approval_requests_for_given_property(
                property_id=property_id, page_size=page_size, page_number=page_number
            )
        )

    async def send_property_child_document_approval_request(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        data, error = await self.repo.send_property_child_document_approval_request(
            property_id=property_id,
            child_id=child_id,
            child_document_id=child_document_id,
            document_type=document_type,
        )
        if error:
            return None, error
        _, socket_error = await try_except(
            self.socket_server.emit,
            COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_REQUESTED,
            data.model_dump(mode="json"),
        )
        if socket_error:
            self.logger.error(socket_error)
        return data, None

    async def get_property_child_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        return (
            await self.repo.get_property_child_document_approval_request_by_document_id(
                property_id=property_id,
                child_id=child_id,
                child_document_id=child_document_id,
            )
        )

    async def set_property_child_document_request_status(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        is_admin, error = await self.identity_client.is_property_admin(
            property_id=property_id, user_id=admin_id
        )
        if error:
            return None, error
        if not is_admin:
            return None, HTTPError(
                code=403, message="Insufficient permissions - required role: 'admin'!"
            )
        data, error = await self.repo.set_property_child_document_request_status(
            property_id=property_id,
            child_id=child_id,
            child_document_id=child_document_id,
            request_status=request_status,
            admin_id=admin_id,
        )
        if error:
            return None, error
        assert data is not None
        event = create_event(
            type=COMPLIANCE_EVENT.PROPERTY_CHILD_DOCUMENT_APPROVED,
            source=__name__,
            version="1.0",
            payload=data,
        )
        if error := await self._publish_event(event):
            return None, error
        return data, None

    async def send_property_parent_partner_document_approval_request(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentPartnerDocument]:
        (
            data,
            error,
        ) = await self.repo.send_property_parent_partner_document_approval_request(
            property_id=property_id,
            partner_id=partner_id,
            parent_partner_document_id=parent_partner_document_id,
            document_type=document_type,
        )
        if error:
            return None, error
        _, socket_error = await try_except(
            self.socket_server.emit,
            COMPLIANCE_EVENT.PROPERTY_PARENT_PARTNER_DOCUMENT_REQUESTED,
            data.model_dump(mode="json"),
        )
        if socket_error:
            self.logger.error(socket_error)
        return data, None

    async def get_all_document_approval_requests_for_given_property_parent_partner(
        self,
        property_id: UUID,
        partner_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyParentPartnerDocument]]:
        return await self.repo.get_all_document_approval_requests_for_given_property_parent_partner(
            property_id=property_id, partner_id=partner_id
        )

    async def get_property_parent_partner_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentPartnerDocument]:
        return await self.repo.get_property_parent_partner_document_approval_request_by_document_id(
            property_id=property_id,
            partner_id=partner_id,
            parent_partner_document_id=parent_partner_document_id,
        )

    async def _publish_event(self, event: EventEnvelope[T]) -> Optional[HTTPError]:
        event_name = event.type
        event_json = event.model_dump_json()
        try:
            await self.redis_client.publish(event_name, event_json)
            self.logger.info(
                f"Published event '{event_name}':\n{json.dumps(json.loads(event_json), indent=2)}"
            )
            return None
        except Exception as e:
            err_msg = f"Error while publishing event '{event_name}': {str(e)}"
            self.logger.error(err_msg)
            return HTTPError(code=500, message=err_msg)
