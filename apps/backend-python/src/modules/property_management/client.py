from abc import ABC, abstractmethod

from src.shared.types.modules.identity import ParentConditionKeys
from src.shared.types.response import HTTPErrorResponse


class IIdentityClient(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        pass
