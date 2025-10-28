from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from src.modules.identity.repo import IIdentityRepo
from src.shared.types.modules.identity.enum import PROPERTY_USER_ROLE
from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentChild,
    ParentConditionKeys,
    PropertyUser,
)


class IIdentitySvc(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> ParentConditionKeys:
        pass

    @abstractmethod
    async def get_property_user(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> PropertyUser:
        pass

    @abstractmethod
    async def get_all_parent_children(
        self,
        parent_id: str,
    ) -> List[ParentChild]:
        pass

    @abstractmethod
    async def get_child_condition_keys(
        self,
        child_id: str,
    ) -> ChildConditionKeys:
        pass

    @abstractmethod
    async def is_property_admin(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> bool:
        pass

    @abstractmethod
    async def get_parent_partner_condition_keys(
        self,
        partner_id: UUID,
    ) -> ParentConditionKeys:
        pass


class IdentitySvc(IIdentitySvc):
    def __init__(self, repo: IIdentityRepo) -> None:
        self.repo = repo

    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> ParentConditionKeys:
        return await self.repo.get_parent_condition_keys(user_id)

    async def get_property_user(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> PropertyUser:
        return await self.repo.get_property_user(
            property_id=property_id, user_id=user_id
        )

    async def get_all_parent_children(
        self,
        parent_id: str,
    ) -> List[ParentChild]:
        return await self.repo.get_all_parent_children(parent_id=parent_id)

    async def get_child_condition_keys(
        self,
        child_id: str,
    ) -> ChildConditionKeys:
        return await self.repo.get_child_condition_keys(child_id=child_id)

    async def is_property_admin(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> bool:
        data = await self.repo.get_property_user(
            property_id=property_id, user_id=user_id
        )
        return data.role is PROPERTY_USER_ROLE.admin

    async def get_parent_partner_condition_keys(
        self,
        partner_id: UUID,
    ) -> ParentConditionKeys:
        return await self.repo.get_parent_partner_condition_keys(partner_id=partner_id)
