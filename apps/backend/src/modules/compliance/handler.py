from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status

from src.modules.compliance.dto import (
    PropertyChildDocumentRequest,
    PropertyParentDocumentRequest,
    PropertyParentPartnerDocumentRequest,
)
from src.modules.compliance.svc import IComplianceSvc
from src.shared.exceptions.validation import ValidationException
from src.shared.types.modules.compliance.enum import REQUEST_STATUS
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
    PropertyParentPartnerDocument,
)
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import (
    AuthMiddlewareResponse,
    AuthMiddlewareSignature,
    HTTPError,
)


class ComplianceHandler:
    def __init__(
        self,
        svc: IComplianceSvc,
        auth_middleware: AuthMiddlewareSignature,
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get(
            "/properties/{property_id}/parents/{parent_id}/parent-document-requests",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": List[PropertyParentDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_document_approval_requests_for_given_property_parent(
            property_id: UUID,
            parent_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyParentDocument]:
            return await self.svc.get_all_document_approval_requests_for_given_property_parent(
                property_id=property_id, user_id=parent_id
            )

        @self.router.get(
            "/properties/{property_id}/children/{child_id}/child-document-requests",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": List[PropertyChildDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_document_approval_requests_for_given_property_child(
            property_id: UUID,
            child_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyChildDocument]:
            return await self.svc.get_all_document_approval_requests_for_given_property_child(
                property_id=property_id, child_id=child_id
            )

        @self.router.get(
            "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_doc_id}",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": PropertyParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_property_parent_document_approval_request_by_document_id(
            property_id: UUID,
            parent_id: UUID,
            parent_doc_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentDocument:
            return await self.svc.get_property_parent_document_approval_request_by_document_id(
                property_id=property_id, user_id=parent_id, parent_doc_id=parent_doc_id
            )

        @self.router.get(
            "/properties/{property_id}/parent-document-requests",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": PagedResponse[PropertyParentDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_document_approval_requests_for_given_property(
            property_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[PropertyParentDocument]:
            return await self.svc.get_all_document_approval_requests_for_given_property(
                property_id=property_id, page_size=page_size, page_number=page_number
            )

        @self.router.post(
            "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_doc_id}",
            status_code=status.HTTP_201_CREATED,
            responses={
                201: {"model": PropertyParentDocument},
                "default": {"model": HTTPError},
            },
        )
        async def send_property_parent_document_approval_request(
            property_id: UUID,
            parent_id: UUID,
            parent_doc_id: UUID,
            body: PropertyParentDocumentRequest,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentDocument:
            return await self.svc.send_property_parent_document_approval_request(
                property_id=property_id,
                user_id=parent_id,
                parent_document_id=parent_doc_id,
                document_type=body.document_type,
                point_value=body.point_value,
            )

        @self.router.patch(
            "/properties/{property_id}/parents/{parent_id}/parent-documents/{parent_document_id}/status/{request_status}",
            status_code=status.HTTP_200_OK,
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
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentDocument:
            if request_status not in REQUEST_STATUS:
                raise ValidationException(message="Invalid request status!")
            return await self.svc.set_property_parent_document_request_status(
                property_id=property_id,
                user_id=parent_id,
                parent_document_id=parent_document_id,
                request_status=request_status,
                admin_id=user_result.get("id"),
            )

        @self.router.get(
            "/properties/{property_id}/child-document-requests",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": PagedResponse[PropertyChildDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_child_document_approval_requests_for_given_property(
            property_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[PropertyChildDocument]:
            return await self.svc.get_all_child_document_approval_requests_for_given_property(
                property_id=property_id, page_size=page_size, page_number=page_number
            )

        @self.router.post(
            "/properties/{property_id}/children/{child_id}/children-documents/{child_document_id}",
            status_code=status.HTTP_201_CREATED,
            responses={
                201: {"model": PropertyChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def send_property_child_document_approval_request(
            property_id: UUID,
            child_id: UUID,
            child_document_id: UUID,
            body: PropertyChildDocumentRequest,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyChildDocument:
            return await self.svc.send_property_child_document_approval_request(
                property_id=property_id,
                child_id=child_id,
                child_document_id=child_document_id,
                document_type=body.document_type,
            )

        @self.router.get(
            "/properties/{property_id}/children/{child_id}/child-documents/{child_document_id}",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": PropertyChildDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_property_child_document_approval_request_by_document_id(
            property_id: UUID,
            child_id: UUID,
            child_document_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyChildDocument:
            return await self.svc.get_property_child_document_approval_request_by_document_id(
                property_id=property_id,
                child_id=child_id,
                child_document_id=child_document_id,
            )

        @self.router.patch(
            "/properties/{property_id}/children/{child_id}/children-documents/{child_document_id}/status/{request_status}",
            status_code=status.HTTP_200_OK,
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
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyChildDocument:
            if request_status not in REQUEST_STATUS:
                raise ValidationException(message="Invalid request status!")
            return await self.svc.set_property_child_document_request_status(
                property_id=property_id,
                child_id=child_id,
                child_document_id=child_document_id,
                request_status=request_status,
                admin_id=user_result.get("id"),
            )

        @self.router.post(
            "/properties/{property_id}/parent-partners/{partner_id}/document-requests/{parent_partner_document_id}",
            status_code=status.HTTP_201_CREATED,
            responses={
                201: {"model": PropertyParentPartnerDocument},
                "default": {"model": HTTPError},
            },
        )
        async def send_property_parent_partner_document_approval_request(
            property_id: UUID,
            partner_id: UUID,
            parent_partner_document_id: UUID,
            body: PropertyParentPartnerDocumentRequest,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentPartnerDocument:
            return (
                await self.svc.send_property_parent_partner_document_approval_request(
                    property_id=property_id,
                    partner_id=partner_id,
                    parent_partner_document_id=parent_partner_document_id,
                    document_type=body.document_type,
                )
            )

        @self.router.get(
            "/properties/{property_id}/parent-partners/{partner_id}/parent-document-requests",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": List[PropertyParentPartnerDocument]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_document_approval_requests_for_given_property_parent_partner(
            property_id: UUID,
            partner_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyParentPartnerDocument]:
            return await self.svc.get_all_document_approval_requests_for_given_property_parent_partner(
                property_id=property_id, partner_id=partner_id
            )

        @self.router.get(
            "/properties/{property_id}/parent-partners/{partner_id}/parent-documents/{parent_partner_document_id}",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": PropertyParentPartnerDocument},
                "default": {"model": HTTPError},
            },
        )
        async def get_property_parent_partner_document_approval_request_by_document_id(
            property_id: UUID,
            partner_id: UUID,
            parent_partner_document_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyParentPartnerDocument:
            return await self.svc.get_property_parent_partner_document_approval_request_by_document_id(
                property_id=property_id,
                partner_id=partner_id,
                parent_partner_document_id=parent_partner_document_id,
            )
