import json
from logging import getLogger
from json import dumps
from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from src.modules.compliance.client import IIdentityClient
from src.modules.compliance.repo import IComplianceRepo
from src.shared.types.modules.compliance.event import COMPLIANCE_EVENT
from src.shared.types.modules.compliance.enum import REQUEST_STATUS
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
)
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPError, HTTPErrorResponse
import redis.asyncio as redis
from src.shared.utils.event import create_event


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


class ComplianceSvc(IComplianceSvc):
    def __init__(
        self,
        repo: IComplianceRepo,
        identity_client: IIdentityClient,
        redis_client: redis.Redis,
    ) -> None:
        self.repo = repo
        self.identity_client = identity_client
        self.redis_client = redis_client
        self.logger = getLogger(__name__)

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
        return await self.repo.get_all_document_approval_requests_for_given_property_parent(
            property_id=property_id, user_id=child_id
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
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        return await self.repo.send_property_parent_document_approval_request(
            property_id=property_id,
            user_id=user_id,
            parent_document_id=parent_document_id,
        )

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
        # TODO: Publish proper event
        event_name = COMPLIANCE_EVENT.PROPERTY_PARENT_DOCUMENT_APPROVED
        event_json = create_event(
            type=event_name,
            source=__name__,
            version="1.0",
            payload=data,
        ).model_dump_json()
        try:
            await self.redis_client.publish(event_name, event_json)
            self.logger.info(
                f"Published event '{event_name}':\n{json.dumps(json.loads(event_json), indent=2)}"
            )
        except Exception as e:
            err_msg = str(e)
            self.logger.error(f"Error while publishing event '{event_name}': {err_msg}")
            return None, HTTPError(code=500, message=err_msg)
        return data, None
