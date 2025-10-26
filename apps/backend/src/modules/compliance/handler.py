from typing import Callable, List
from uuid import UUID
import uuid
from fastapi import APIRouter, Response, Depends, Query
from fastapi.responses import JSONResponse

from src.modules.compliance.dto import (
    PropertyChildDocumentRequest,
    PropertyParentDocumentRequest,
)
from src.modules.compliance.svc import IComplianceSvc
from src.shared.types.modules.compliance.enum import REQUEST_STATUS
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
)
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import AuthMiddlewareResponse, HTTPError


class ComplianceHandler:
    def __init__(
        self,
        svc: IComplianceSvc,
        auth_middleware: Callable[..., AuthMiddlewareResponse],
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get(
            "/properties/{property_id}/parents/{parent_id}/parent-document-requests",
            responses={
                200: {"model": List[PropertyParentDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_document_approval_requests_for_given_property_parent(
            property_id: UUID,
            parent_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyParentDocument]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_all_document_approval_requests_for_given_property_parent(
                property_id=property_id, user_id=parent_id
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.get(
            "/properties/{property_id}/children/{child_id}/child-document-requests",
            responses={
                200: {"model": List[PropertyChildDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_document_approval_requests_for_given_property_child(
            property_id: UUID,
            child_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyChildDocument]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_all_document_approval_requests_for_given_property_child(
                property_id=property_id, child_id=child_id
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.get(
            "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_doc_id}",
            responses={
                200: {"model": PropertyParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_property_parent_document_approval_request_by_document_id(
            property_id: UUID,
            parent_id: UUID,
            parent_doc_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentDocument:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_property_parent_document_approval_request_by_document_id(
                property_id=property_id, user_id=parent_id, parent_doc_id=parent_doc_id
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.get(
            "/properties/{property_id}/parent-document-requests",
            responses={
                200: {"model": PagedResponse[PropertyParentDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_document_approval_requests_for_given_property(
            property_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[PropertyParentDocument]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_all_document_approval_requests_for_given_property(
                property_id=property_id, page_size=page_size, page_number=page_number
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.post(
            "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_doc_id}",
            responses={
                201: {"model": PropertyParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def send_property_parent_document_approval_request(
            property_id: UUID,
            parent_id: UUID,
            parent_doc_id: UUID,
            response: Response,
            body: PropertyParentDocumentRequest,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentDocument:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.send_property_parent_document_approval_request(
                property_id=property_id,
                user_id=parent_id,
                parent_document_id=parent_doc_id,
                document_type=body.document_type,
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 201
            assert data is not None
            return data

        @self.router.patch(
            "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_document_id}/status/{request_status}",
            responses={
                200: {"model": PropertyParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def set_property_parent_document_request_status(
            property_id: UUID,
            parent_id: UUID,
            parent_document_id: UUID,
            request_status: REQUEST_STATUS,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentDocument:
            if request_status not in REQUEST_STATUS:
                return JSONResponse(
                    status_code=400,
                    content=HTTPError(
                        code=400, message="Invalid request status!"
                    ).dict(),
                )
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            assert user is not None
            uid = user.get("id")
            (
                data,
                error,
            ) = await self.svc.set_property_parent_document_request_status(
                property_id=property_id,
                user_id=parent_id,
                parent_document_id=parent_document_id,
                request_status=request_status,
                admin_id=uid if uid else uuid.UUID(int=0),
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.get(
            "/properties/{property_id}/child-document-requests",
            responses={
                200: {"model": PagedResponse[PropertyChildDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_child_document_approval_requests_for_given_property(
            property_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[PropertyChildDocument]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_all_child_document_approval_requests_for_given_property(
                property_id=property_id, page_size=page_size, page_number=page_number
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.post(
            "/properties/{property_id}/children/{child_id}/children-documents/{child_document_id}",
            responses={
                201: {"model": PropertyChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def send_property_child_document_approval_request(
            property_id: UUID,
            child_id: UUID,
            child_document_id: UUID,
            response: Response,
            body: PropertyChildDocumentRequest,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyChildDocument:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.send_property_child_document_approval_request(
                property_id=property_id,
                child_id=child_id,
                child_document_id=child_document_id,
                document_type=body.document_type,
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 201
            assert data is not None
            return data

        @self.router.get(
            "/properties/{property_id}/children/{child_id}/child-documents/{child_document_id}",
            responses={
                200: {"model": PropertyChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_property_child_document_approval_request_by_document_id(
            property_id: UUID,
            child_id: UUID,
            child_document_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyChildDocument:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_property_child_document_approval_request_by_document_id(
                property_id=property_id,
                child_id=child_id,
                child_document_id=child_document_id,
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.patch(
            "/properties/{property_id}/children/{child_id}/children-documents/{child_document_id}/status/{request_status}",
            responses={
                200: {"model": PropertyChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def set_property_child_document_request_status(
            property_id: UUID,
            child_id: UUID,
            child_document_id: UUID,
            request_status: REQUEST_STATUS,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyChildDocument:
            if request_status not in REQUEST_STATUS:
                return JSONResponse(
                    status_code=400,
                    content=HTTPError(
                        code=400, message="Invalid request status!"
                    ).dict(),
                )
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            assert user is not None
            uid = user.get("id")
            (
                data,
                error,
            ) = await self.svc.set_property_child_document_request_status(
                property_id=property_id,
                child_id=child_id,
                child_document_id=child_document_id,
                request_status=request_status,
                admin_id=uid if uid else uuid.UUID(int=0),
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data
