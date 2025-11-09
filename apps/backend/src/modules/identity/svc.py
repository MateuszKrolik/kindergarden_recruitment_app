from abc import ABC, abstractmethod
import logging
from uuid import UUID

from src.modules.identity.cache import IDENTITY_NAMESPACE, get_property_user_key_builder
from src.modules.identity.repo import IIdentityRepo
from src.shared.decorators.cache import redis_cache
from src.shared.types.modules.identity.enum import PROPERTY_USER_ROLE
from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentConditionKeys,
    PropertyUser,
)


class IIdentitySvc(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: UUID,
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
    async def get_child_condition_keys(
        self,
        child_id: UUID,
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
        user_id: UUID,
    ) -> ParentConditionKeys:
        return await self.repo.get_parent_condition_keys(user_id)

    @redis_cache(
        key_builder=get_property_user_key_builder, namespace=IDENTITY_NAMESPACE
    )
    async def get_property_user(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> PropertyUser:
        return await self.repo.get_property_user(
            property_id=property_id, user_id=user_id
        )

    async def get_child_condition_keys(
        self,
        child_id: UUID,
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
