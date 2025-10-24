from typing import Callable
from uuid import UUID
from fastapi import APIRouter, Response, Depends
from fastapi.responses import JSONResponse

from src.modules.identity.svc import IIdentitySvc
from src.shared.types.modules.identity.model import PropertyUser
from src.shared.types.response import AuthMiddlewareResponse, HTTPError


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
        @self.router.get(
            "/properties/{property_id}/users/{user_id}",
            responses={
                200: {"model": PropertyUser},
                "default": {"model": HTTPError},
            },
        )
        async def get_properties(
            property_id: UUID,
            user_id: UUID,
            response: Response,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyUser:
            user, error = user_result
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            data, error = await self.svc.get_property_user(
                property_id=property_id, user_id=user_id
            )
            if error:
                return JSONResponse(
                    status_code=error.code,
                    content=error.dict(),
                )
            response.status_code = 200
            assert data is not None
            return data
