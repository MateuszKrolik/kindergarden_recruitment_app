from abc import ABC, abstractmethod
from typing import List

from src.modules.identity.repo import IIdentityRepo
from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentChild,
    ParentConditionKeys,
    PropertyUser,
)
from src.shared.types.response import HTTPErrorResponse


class IIdentitySvc(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        pass

    @abstractmethod
    async def get_property_user(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[PropertyUser]:
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


class IdentitySvc(IIdentitySvc):
    def __init__(self, repo: IIdentityRepo) -> None:
        self.repo = repo

    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        return await self.repo.get_parent_condition_keys(user_id)

    async def get_property_user(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[PropertyUser]:
        return await self.repo.get_property_user(
            property_id=property_id, user_id=user_id
        )

    async def get_all_parent_children(
        self,
        parent_id: str,
    ) -> HTTPErrorResponse[List[ParentChild]]:
        return await self.repo.get_all_parent_children(parent_id=parent_id)

    async def get_child_condition_keys(
        self,
        child_id: str,
    ) -> HTTPErrorResponse[ChildConditionKeys]:
        return await self.repo.get_child_condition_keys(child_id=child_id)
