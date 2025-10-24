from typing import Callable, List
from fastapi import APIRouter, Query, Response, Depends
from fastapi.responses import JSONResponse

from src.shared.types.modules.property_management.model import (
    Property,
    PropertyChild,
    PropertyChildDocumentRequirement,
    PropertyParentDocumentRequirement,
)
from src.modules.property_management.svc import IPropertyManagementSvc
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import AuthMiddlewareResponse, HTTPError


class PropertyManagementHandler:
    def __init__(
        self,
        svc: IPropertyManagementSvc,
        auth_middleware: Callable[..., AuthMiddlewareResponse],
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get(
            "/properties",
            responses={
                200: {"model": PagedResponse[Property]},
                "default": {"model": HTTPError},
            },
        )
        async def get_properties(
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[Property]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_all_properties(page_size, page_number)
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data

        @self.router.get(
            "/properties/{property_id}/users/{user_id}/parent-document-requirements",
            responses={
                200: {"model": List[PropertyParentDocumentRequirement]},
                "default": {"model": HTTPError},
            },
        )
        async def get_document_requirements_for_given_property_parent(
            property_id,
            user_id,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyParentDocumentRequirement]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_document_requirements_for_given_property_parent(
                property_id,
                user_id,
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
            "/properties/{property_id}/parents/{parent_id}/property-children",
            responses={
                200: {"model": List[PropertyChild]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_property_children_for_given_parent(
            property_id,
            parent_id,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyChild]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_all_property_children_for_given_parent(
                property_id,
                parent_id,
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
            "/properties/{property_id}/children/{child_id}/document-requirements",
            responses={
                200: {"model": List[PropertyChildDocumentRequirement]},
                "default": {"model": HTTPError},
            },
        )
        async def get_document_requirements_for_given_property_child(
            property_id,
            child_id,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> List[PropertyChildDocumentRequirement]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            (
                data,
                error,
            ) = await self.svc.get_document_requirements_for_given_property_child(
                property_id,
                child_id,
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
            "/properties/{property_id}/property-children",
            responses={
                200: {"model": PagedResponse[PropertyChild]},
                "default": {"model": HTTPError},
            },
        )
        async def get_all_property_children_paged(
            response: Response,
            property_id,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> PagedResponse[PropertyChild]:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_all_property_children_paged(
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
