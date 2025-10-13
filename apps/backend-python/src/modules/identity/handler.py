from typing import Callable
from fastapi import APIRouter, Response, Depends

from src.modules.identity.svc import IIdentitySvc
from src.shared.types.modules.identity.model import PropertyUser
from src.shared.types.response import ApiResponse, AuthMiddlewareResponse


class IdentityHandler:
    def __init__(
        self,
        svc: IIdentitySvc,
        auth_middleware: Callable[..., AuthMiddlewareResponse],
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get("/properties/{property_id}/users/{user_id}")
        async def get_properties(
            property_id: str,
            user_id: str,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> ApiResponse[PropertyUser]:
            user, error = user_result
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            data, error = await self.svc.get_property_user(
                property_id=property_id, user_id=user_id
            )
            if error:
                response.status_code = error.code
                return ApiResponse(error=error)
            response.status_code = 200
            return ApiResponse(data=data)
