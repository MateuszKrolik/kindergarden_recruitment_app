from abc import ABC, abstractmethod
from uuid import UUID


class IIdentityClient(ABC):
    @abstractmethod
    async def is_property_admin(self, property_id: UUID, user_id: UUID) -> bool:
        pass
