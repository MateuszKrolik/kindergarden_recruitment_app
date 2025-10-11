from typing import Callable
from fastapi import APIRouter, Query, Response, Depends

from src.modules.property_management.model import Property
from src.modules.property_management.svc import IPropertyManagementSvc
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import ApiResponse, AuthMiddlewareResponse


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
        @self.router.get("/properties")
        async def get_properties(
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
            page_size: int = Query(1, ge=1),
            page_number: int = Query(1, ge=1),
        ) -> ApiResponse[PagedResponse[Property]]:
            user, error = user_result
            if error:
                return ApiResponse(error=error)
            data, error = await self.svc.get_all_properties(page_size, page_number)
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)
