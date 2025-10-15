from abc import ABC, abstractmethod
from typing import List

from src.modules.compliance.repo import IComplianceRepo
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
)
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPErrorResponse


class IComplianceSvc(ABC):
    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: str,
        child_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocument]]:
        pass

    @abstractmethod
    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: str,
        user_id: str,
        parent_doc_id: str,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyParentDocument]]:
        pass


class ComplianceSvc(IComplianceSvc):
    def __init__(self, repo: IComplianceRepo) -> None:
        self.repo = repo

    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        return await self.repo.get_all_document_approval_requests_for_given_property_parent(
            property_id=property_id, user_id=user_id
        )

    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: str,
        child_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocument]]:
        return await self.repo.get_all_document_approval_requests_for_given_property_parent(
            property_id=property_id, user_id=child_id
        )

    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: str,
        user_id: str,
        parent_doc_id: str,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        return await self.repo.get_property_parent_document_approval_request_by_document_id(
            property_id=property_id, user_id=user_id, parent_doc_id=parent_doc_id
        )

    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyParentDocument]]:
        return await self.repo.get_all_document_approval_requests_for_given_property(
            property_id=property_id,
            page_size=page_size,
            page_number=page_number,
        )
