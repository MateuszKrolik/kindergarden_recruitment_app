from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File

from src.modules.reporting.svc import IReportingSvc
from src.shared.exceptions.validation import ValidationException
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import (
    ChildDocument,
    ParentDocument,
    ParentPartnerDocument,
)
from src.shared.types.response import (
    AuthMiddlewareResponse,
    AuthMiddlewareSignature,
    HTTPError,
)


class ReportingHandler:
    def __init__(
        self,
        svc: IReportingSvc,
        auth_middleware: AuthMiddlewareSignature,
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get(
            "/parents/{parent_id}/documents/{document_type}",
            status_code=200,
            responses={
                200: {"model": ParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_parent_document_by_type(
            parent_id: UUID,
            document_type,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ParentDocument:
            if document_type not in DOCUMENT_TYPE:
                raise ValidationException(message="Invalid document type!")
            return await self.svc.get_parent_document_by_type(
                user_id=parent_id, document_type=document_type
            )

        @self.router.get(
            "/parent-documents/{doc_id}",
            status_code=200,
            responses={
                200: {"model": str},
                "default": {"model": HTTPError},
            },
        )
        async def get_parent_document_url_by_document_id(
            doc_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> str:
            return await self.svc.get_parent_document_url_by_document_id(doc_id=doc_id)

        @self.router.get(
            "/documents/{file_path:path}",
            status_code=200,
            responses={
                200: {"model": str},
                "default": {"model": HTTPError},
            },
        )
        async def get_document_url_by_file_path(
            file_path: str,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> str:
            return await self.svc.get_document_url_by_file_path(path=file_path)

        @self.router.post(
            "/parents/{parent_id}/documents/{document_type}",
            status_code=201,
            responses={
                201: {"model": ParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def save_parent_document(
            parent_id: UUID,
            document_type: DOCUMENT_TYPE,
            file: UploadFile = File(...),
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ParentDocument:
            if document_type not in DOCUMENT_TYPE:
                raise ValidationException(message="Invalid document type!")
            return await self.svc.save_parent_document(
                user_id=parent_id, document_type=document_type, file=file
            )

        @self.router.get(
            "/children/{child_id}/documents/{document_type}",
            status_code=200,
            responses={
                200: {"model": ChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_child_document_by_type(
            child_id: UUID,
            document_type: CHILD_DOCUMENT_TYPE,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ChildDocument:
            if document_type not in CHILD_DOCUMENT_TYPE:
                raise ValidationException(message="Invalid document type!")
            return await self.svc.get_child_document_by_type(
                child_id=child_id, document_type=document_type
            )

        @self.router.post(
            "/children/{child_id}/documents/{document_type}",
            status_code=201,
            responses={
                201: {"model": ChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def save_child_document(
            child_id: UUID,
            document_type: CHILD_DOCUMENT_TYPE,
            file: UploadFile = File(...),
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ChildDocument:
            if document_type not in CHILD_DOCUMENT_TYPE:
                raise ValidationException(message="Invalid document type!")
            return await self.svc.save_child_document(
                child_id=child_id, document_type=document_type, file=file
            )

        @self.router.get(
            "/children-documents/{doc_id}",
            status_code=200,
            responses={
                200: {"model": str},
                "default": {"model": HTTPError},
            },
        )
        async def get_child_document_url_by_document_id(
            doc_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> str:
            return await self.svc.get_child_document_url_by_document_id(doc_id=doc_id)

        @self.router.get(
            "/parent-partners/{partner_id}/documents/{document_type}",
            status_code=200,
            responses={
                200: {"model": ParentPartnerDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_parent_partner_document_by_type(
            partner_id: UUID,
            document_type,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ParentPartnerDocument:
            if document_type not in DOCUMENT_TYPE:
                raise ValidationException(message="Invalid document type!")
            return await self.svc.get_parent_partner_document_by_type(
                partner_id=partner_id, document_type=document_type
            )

        @self.router.post(
            "/parent-partners/{partner_id}/documents/{document_type}",
            status_code=201,
            responses={
                201: {"model": ParentPartnerDocument},
                "default": {"model": HTTPError},
            },
        )
        async def save_parent_partner_document(
            partner_id: UUID,
            document_type: DOCUMENT_TYPE,
            file: UploadFile = File(...),
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ParentPartnerDocument:
            if document_type not in DOCUMENT_TYPE:
                raise ValidationException(message="Invalid document type!")
            return await self.svc.save_parent_partner_document(
                partner_id=partner_id, document_type=document_type, file=file
            )
