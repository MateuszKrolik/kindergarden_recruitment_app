from abc import ABC, abstractmethod
from uuid import UUID
from src.modules.reporting.repo import IReportingRepo
from src.shared.types.modules.reporting.enum import DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import ParentDocument
from src.shared.types.response import HTTPErrorResponse


class IReportingSvc(ABC):
    @abstractmethod
    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[ParentDocument]:
        pass


class ReportingSvc(IReportingSvc):
    def __init__(self, repo: IReportingRepo) -> None:
        self.repo = repo

    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[ParentDocument]:
        return await self.repo.get_parent_document_by_type(
            user_id=user_id, document_type=document_type
        )
