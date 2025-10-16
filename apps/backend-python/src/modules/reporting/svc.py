from abc import ABC, abstractmethod
from uuid import UUID
from src.modules.reporting.repo import IReportingRepo
from src.modules.reporting.s3 import IS3Repository
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

    @abstractmethod
    async def get_parent_document_url_by_document_id(
        self, doc_id: UUID
    ) -> HTTPErrorResponse[str]:
        pass

    @abstractmethod
    async def get_document_url_by_file_path(
        self,
        path: str,
    ) -> HTTPErrorResponse[str]:
        pass


class ReportingSvc(IReportingSvc):
    def __init__(self, repo: IReportingRepo, s3_repo: IS3Repository) -> None:
        self.repo = repo
        self.s3_repo = s3_repo

    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[ParentDocument]:
        return await self.repo.get_parent_document_by_type(
            user_id=user_id, document_type=document_type
        )

    async def get_parent_document_url_by_document_id(
        self, doc_id: UUID
    ) -> HTTPErrorResponse[str]:
        path, error = await self.repo.get_parent_document_file_path_by_document_id(
            doc_id=doc_id
        )
        if error:
            return None, error
        assert path is not None
        return await self.get_document_url_by_file_path(path=path)

    async def get_document_url_by_file_path(
        self,
        path: str,
    ) -> HTTPErrorResponse[str]:
        return await self.s3_repo.get_document_url_by_file_path(key=path)
