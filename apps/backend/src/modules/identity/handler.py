from uuid import UUID
from fastapi import APIRouter, Depends, status

from src.modules.identity.svc import IIdentitySvc
from src.shared.types.modules.identity.model import PropertyUser
from src.shared.types.response import (
    AuthMiddlewareResponse,
    AuthMiddlewareSignature,
    HTTPError,
)


class IdentityHandler:
    def __init__(
        self,
        svc: IIdentitySvc,
        auth_middleware: AuthMiddlewareSignature,
    ):
        self.svc = svc
        self.router = APIRouter()
        self.auth_middleware = auth_middleware
        self.register_routes()

    def register_routes(self):
        @self.router.get(
            "/properties/{property_id}/users/{user_id}",
            status_code=status.HTTP_200_OK,
            responses={
                200: {"model": PropertyUser},
                "default": {"model": HTTPError},
            },
        )
        async def get_property_user(
            property_id: UUID,
            user_id: UUID,
            user_result: AuthMiddlewareResponse = Depends(self.auth_middleware),
        ) -> PropertyUser:
            return await self.svc.get_property_user(
                property_id=property_id, user_id=user_id
            )
