from typing import List
from uuid import UUID
from fastapi import APIRouter, Query, Depends

from src.shared.types.modules.property_management.model import (
    Property,
    PropertyChild,
    PropertyChildDocumentRequirement,
    PropertyParentDocumentRequirement,
)
from src.modules.property_management.svc import IPropertyManagementSvc
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import (
    AuthMiddlewareResponse,
    AuthMiddlewareSignature,
    HTTPError,
)


class PropertyManagementHandler:
    def __init__(
        self,
        svc: IPropertyManagementSvc,
        auth_middleware: AuthMiddlewareSignature,
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get(
            "/properties",
            status_code=200,
            responses={
                200: {"model": PagedResponse[Property]},
                "default": {"model": HTTPError},
            },
        )
        async def get_properties(
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[Property]:
            return await self.svc.get_all_properties(page_size, page_number)

        @self.router.get(
            "/properties/{property_id}/users/{user_id}/parent-document-requirements",
            status_code=200,
            responses={
                200: {"model": List[PropertyParentDocumentRequirement]},
                "default": {"model": HTTPError},
            },
        )
        async def get_document_requirements_for_given_property_parent(
            property_id,
            user_id,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyParentDocumentRequirement]:
            return await self.svc.get_document_requirements_for_given_property_parent(
                property_id,
                user_id,
            )

        @self.router.get(
            "/properties/{property_id}/parents/{parent_id}/property-children",
            status_code=200,
            responses={
                200: {"model": List[PropertyChild]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_property_children_for_given_parent(
            property_id,
            parent_id,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyChild]:
            return await self.svc.get_all_property_children_for_given_parent(
                property_id,
                parent_id,
            )

        @self.router.get(
            "/properties/{property_id}/children/{child_id}/document-requirements",
            status_code=200,
            responses={
                200: {"model": List[PropertyChildDocumentRequirement]},
                "default": {"model": HTTPError},
            },
        )
        async def get_document_requirements_for_given_property_child(
            property_id,
            child_id,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyChildDocumentRequirement]:
            return await self.svc.get_document_requirements_for_given_property_child(
                property_id,
                child_id,
            )

        @self.router.get(
            "/properties/{property_id}/property-children",
            status_code=200,
            responses={
                200: {"model": PagedResponse[PropertyChild]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_property_children_paged(
            property_id,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[PropertyChild]:
            return await self.svc.get_all_property_children_paged(
                property_id=property_id, page_size=page_size, page_number=page_number
            )

        @self.router.get(
            "/properties/{property_id}/parent-partners/{partner_id}/parent-document-requirements",
            status_code=200,
            responses={
                200: {"model": List[PropertyParentDocumentRequirement]},
                "default": {"model": HTTPError},
            },
        )
        async def get_document_requirements_for_given_property_parent_partner(
            property_id: UUID,
            partner_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyParentDocumentRequirement]:
            return await self.svc.get_document_requirements_for_given_property_parent_partner(
                property_id=property_id,
                partner_id=partner_id,
            )
