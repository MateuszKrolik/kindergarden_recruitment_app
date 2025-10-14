from typing import Callable, List
from fastapi import APIRouter, Response, Depends

from src.modules.compliance.svc import IComplianceSvc
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
)
from src.shared.types.response import ApiResponse, AuthMiddlewareResponse


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
            "/properties/{property_id}/parents/{parent_id}/parent-document-requests"
        )
        async def get_properties(
            property_id,
            parent_id,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ApiResponse[List[PropertyParentDocument]]:
            user, error = user_result
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            (
                data,
                error,
            ) = await self.svc.get_all_document_approval_requests_for_given_property_parent(
                property_id=property_id, user_id=parent_id
            )
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)

        @self.router.get(
            "/properties/{property_id}/children/{child_id}/child-document-requests"
        )
        async def get_all_document_approval_requests_for_given_property_child(
            property_id,
            child_id,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ApiResponse[List[PropertyChildDocument]]:
            user, error = user_result
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            (
                data,
                error,
            ) = await self.svc.get_all_document_approval_requests_for_given_property_child(
                property_id=property_id, child_id=child_id
            )
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)

        @self.router.get(
            "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_doc_id}"
        )
        async def get_property_parent_document_approval_request_by_document_id(
            property_id,
            parent_id,
            parent_doc_id,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ApiResponse[PropertyParentDocument]:
            user, error = user_result
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            (
                data,
                error,
            ) = await self.svc.get_property_parent_document_approval_request_by_document_id(
                property_id=property_id, user_id=parent_id, parent_doc_id=parent_doc_id
            )
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)
