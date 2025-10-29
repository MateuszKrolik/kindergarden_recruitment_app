from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentChild,
    ParentConditionKeys,
)


class IIdentityClient(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: UUID,
    ) -> ParentConditionKeys:
        pass

    @abstractmethod
    async def get_all_parent_children(
        self,
        parent_id: UUID,
    ) -> List[ParentChild]:
        pass

    @abstractmethod
    async def get_child_condition_keys(
        self,
        child_id: UUID,
    ) -> ChildConditionKeys:
        pass

    @abstractmethod
    async def get_parent_partner_condition_keys(
        self,
        partner_id: UUID,
    ) -> ParentConditionKeys:
        pass
