import os
from abc import ABC, abstractmethod
from uuid import UUID
from fastapi import UploadFile, File
from src.modules.reporting.repo import IReportingRepo
from src.modules.reporting.s3 import IS3Repository
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import (
    ChildDocument,
    ParentDocument,
    ParentPartnerDocument,
)


class IReportingSvc(ABC):
    @abstractmethod
    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> ParentDocument:
        pass

    @abstractmethod
    async def get_parent_document_url_by_document_id(self, doc_id: UUID) -> str:
        pass

    @abstractmethod
    async def get_document_url_by_file_path(
        self,
        path: str,
    ) -> str:
        pass

    @abstractmethod
    async def save_parent_document(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> ParentDocument:
        pass

    @abstractmethod
    async def get_child_document_by_type(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> ChildDocument:
        pass

    @abstractmethod
    async def save_child_document(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> ChildDocument:
        pass

    @abstractmethod
    async def get_child_document_url_by_document_id(self, doc_id: UUID) -> str:
        pass

    @abstractmethod
    async def get_parent_partner_document_by_type(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> ParentPartnerDocument:
        pass

    @abstractmethod
    async def save_parent_partner_document(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> ParentPartnerDocument:
        pass


class ReportingSvc(IReportingSvc):
    def __init__(self, repo: IReportingRepo, s3_repo: IS3Repository) -> None:
        self.repo = repo
        self.s3_repo = s3_repo

    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> ParentDocument:
        return await self.repo.get_parent_document_by_type(
            user_id=user_id, document_type=document_type
        )

    async def get_parent_document_url_by_document_id(self, doc_id: UUID) -> str:
        path = await self.repo.get_parent_document_file_path_by_document_id(
            doc_id=doc_id
        )
        return await self.get_document_url_by_file_path(path=path)

    async def get_document_url_by_file_path(
        self,
        path: str,
    ) -> str:
        return await self.s3_repo.get_document_url_by_file_path(key=path)

    async def save_parent_document(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> ParentDocument:
        _, ext = os.path.splitext(file.filename)
        file_path = f"parents/{user_id}/documents/{document_type}{ext}"
        file_content = await file.read()
        await self.s3_repo.upload_file(key=file_path, file_content=file_content)
        return await self.repo.save_parent_document(
            user_id=user_id, document_type=document_type, file_path=file_path
        )

    async def get_child_document_by_type(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> ChildDocument:
        return await self.repo.get_child_document_by_type(
            child_id=child_id, document_type=document_type
        )

    async def save_child_document(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> ChildDocument:
        _, ext = os.path.splitext(file.filename)
        file_path = f"children/{child_id}/documents/{document_type}{ext}"
        file_content = await file.read()
        await self.s3_repo.upload_file(key=file_path, file_content=file_content)
        return await self.repo.save_child_document(
            child_id=child_id, document_type=document_type, file_path=file_path
        )

    async def get_child_document_url_by_document_id(self, doc_id: UUID) -> str:
        path = await self.repo.get_child_document_file_path_by_document_id(
            doc_id=doc_id
        )
        return await self.get_document_url_by_file_path(path=path)

    async def get_parent_partner_document_by_type(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> ParentPartnerDocument:
        return await self.repo.get_parent_partner_document_by_type(
            partner_id=partner_id, document_type=document_type
        )

    async def save_parent_partner_document(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
        file: UploadFile = File(...),
    ) -> ParentPartnerDocument:
        _, ext = os.path.splitext(file.filename)
        file_path = f"parents/partners/{partner_id}/documents/{document_type}{ext}"
        file_content = await file.read()
        await self.s3_repo.upload_file(key=file_path, file_content=file_content)
        return await self.repo.save_parent_partner_document(
            partner_id=partner_id, document_type=document_type, file_path=file_path
        )
