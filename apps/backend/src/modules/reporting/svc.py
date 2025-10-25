import os
from abc import ABC, abstractmethod
from uuid import UUID
from fastapi import UploadFile, File
from src.modules.reporting.repo import IReportingRepo
from src.modules.reporting.s3 import IS3Repository
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import ChildDocument, ParentDocument
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

    @abstractmethod
    async def save_parent_document(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> HTTPErrorResponse[ParentDocument]:
        pass

    @abstractmethod
    async def get_parent_document_type_by_document_id(
        self,
        parent_document_id: UUID,
    ) -> HTTPErrorResponse[DOCUMENT_TYPE]:
        pass

    @abstractmethod
    async def get_child_document_by_type(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[ChildDocument]:
        pass

    @abstractmethod
    async def save_child_document(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> HTTPErrorResponse[ChildDocument]:
        pass

    @abstractmethod
    async def get_child_document_url_by_document_id(
        self, doc_id: UUID
    ) -> HTTPErrorResponse[str]:
        pass

    @abstractmethod
    async def get_child_document_type_by_document_id(
        self,
        child_document_id: UUID,
    ) -> HTTPErrorResponse[CHILD_DOCUMENT_TYPE]:
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

    async def save_parent_document(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> HTTPErrorResponse[ParentDocument]:
        _, ext = os.path.splitext(file.filename)
        file_path = f"parents/{user_id}/documents/{document_type}{ext}"
        file_content = await file.read()
        _, error = await self.s3_repo.upload_file(
            key=file_path, file_content=file_content
        )
        if error:
            return None, error
        return await self.repo.save_parent_document(
            user_id=user_id, document_type=document_type, file_path=file_path
        )

    async def get_parent_document_type_by_document_id(
        self,
        parent_document_id: UUID,
    ) -> HTTPErrorResponse[DOCUMENT_TYPE]:
        return await self.repo.get_parent_document_type_by_document_id(
            parent_document_id=parent_document_id
        )

    async def get_child_document_by_type(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[ChildDocument]:
        return await self.repo.get_child_document_by_type(
            child_id=child_id, document_type=document_type
        )

    async def save_child_document(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> HTTPErrorResponse[ChildDocument]:
        _, ext = os.path.splitext(file.filename)
        file_path = f"children/{child_id}/documents/{document_type}{ext}"
        file_content = await file.read()
        _, error = await self.s3_repo.upload_file(
            key=file_path, file_content=file_content
        )
        if error:
            return None, error
        return await self.repo.save_child_document(
            child_id=child_id, document_type=document_type, file_path=file_path
        )

    async def get_child_document_url_by_document_id(
        self, doc_id: UUID
    ) -> HTTPErrorResponse[str]:
        path, error = await self.repo.get_child_document_file_path_by_document_id(
            doc_id=doc_id
        )
        if error:
            return None, error
        assert path is not None
        return await self.get_document_url_by_file_path(path=path)

    async def get_child_document_type_by_document_id(
        self,
        child_document_id: UUID,
    ) -> HTTPErrorResponse[CHILD_DOCUMENT_TYPE]:
        return await self.repo.get_child_document_type_by_document_id(
            child_document_id=child_document_id
        )
