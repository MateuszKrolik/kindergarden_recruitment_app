from abc import ABC, abstractmethod
from uuid import UUID

from src.shared.types.response import HTTPErrorResponse


class IIdentityClient(ABC):
    @abstractmethod
    async def is_property_admin(
        self, property_id: UUID, user_id: UUID
    ) -> HTTPErrorResponse[bool]:
        pass
