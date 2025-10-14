from abc import ABC, abstractmethod
from typing import List

from src.modules.compliance.repo import IComplianceRepo
from src.shared.types.modules.compliance.model import PropertyParentDocument
from src.shared.types.response import HTTPErrorResponse


class IComplianceSvc(ABC):
    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
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
