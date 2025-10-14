from abc import ABC, abstractmethod
from typing import List

from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentChild,
    ParentConditionKeys,
)
from src.shared.types.response import HTTPErrorResponse


class IIdentityClient(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        pass

    @abstractmethod
    async def get_all_parent_children(
        self,
        parent_id: str,
    ) -> HTTPErrorResponse[List[ParentChild]]:
        pass

    @abstractmethod
    async def get_child_condition_keys(
        self,
        child_id: str,
    ) -> HTTPErrorResponse[ChildConditionKeys]:
        pass
