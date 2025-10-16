from typing import Callable
from uuid import UUID
from fastapi import APIRouter, Response, Depends

from src.modules.reporting.svc import IReportingSvc
from src.shared.types.modules.reporting.enum import DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import ParentDocument
from src.shared.types.response import ApiResponse, AuthMiddlewareResponse, HTTPError


class ReportingHandler:
    def __init__(
        self,
        svc: IReportingSvc,
        auth_middleware: Callable[..., AuthMiddlewareResponse],
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get("/parents/{parent_id}/documents/{document_type}")
        async def get_parent_document_by_type(
            parent_id: UUID,
            document_type,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ApiResponse[ParentDocument]:
            if document_type not in DOCUMENT_TYPE:
                return ApiResponse(
                    error=HTTPError(
                        code=400,
                        message="Invalid document type!",
                    )
                )
            user, error = user_result
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            data, error = await self.svc.get_parent_document_by_type(
                user_id=parent_id, document_type=document_type
            )
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)

        @self.router.get("/parent-documents/{doc_id}")
        async def get_parent_document_url_by_document_id(
            doc_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ApiResponse[str]:
            user, error = user_result
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            data, error = await self.svc.get_parent_document_url_by_document_id(
                doc_id=doc_id
            )
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)

        @self.router.get("/documents/{file_path:path}")
        async def get_document_url_by_file_path(
            file_path: str,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ApiResponse[str]:
            user, error = user_result
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            data, error = await self.svc.get_document_url_by_file_path(path=file_path)
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)
