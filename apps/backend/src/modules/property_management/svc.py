import asyncio
from abc import ABC, abstractmethod
from typing import List
from uuid import UUID
from src.modules.property_management.client import IIdentityClient
from src.shared.types.modules.property_management.enum import (
    CHILD_CONDITION_KEY,
    CONDITION_KEY,
    REQUIREMENT_TYPE,
)
from src.shared.types.modules.property_management.model import (
    Property,
    PropertyChild,
    PropertyChildDocumentRequirement,
    PropertyParentDocumentRequirement,
)
from src.modules.property_management.repo import IPropertyManagementRepo
from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentConditionKeys,
)
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.pagination import PagedResponse


class IPropertyManagementSvc(ABC):
    @abstractmethod
    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[Property]:
        pass

    @abstractmethod
    async def get_document_requirements_for_given_property_parent(
        self, property_id: str, user_id: str
    ) -> List[PropertyParentDocumentRequirement]:
        pass

    @abstractmethod
    async def get_all_property_children_for_given_parent(
        self, property_id: str, parent_id: str
    ) -> List[PropertyChild]:
        pass

    @abstractmethod
    async def get_all_property_children(
        self,
        property_id: str,
    ) -> List[PropertyChild]:
        pass

    @abstractmethod
    async def get_document_requirements_for_given_property_child(
        self,
        property_id: str,
        child_id: str,
    ) -> List[PropertyChildDocumentRequirement]:
        pass

    @abstractmethod
    async def get_all_property_children_paged(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyChild]:
        pass

    @abstractmethod
    async def get_point_value_for_given_property_parent_document_by_document_type(
        self,
        property_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> int:
        pass

    @abstractmethod
    async def get_point_value_for_given_property_child_document_by_document_type(
        self,
        property_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> int:
        pass

    @abstractmethod
    async def increment_property_children_points_for_given_parent(
        self,
        property_id: UUID,
        children_ids: List[UUID],
        point_value: int,
    ) -> List[PropertyChild]:
        pass

    @abstractmethod
    async def get_property_child_by_id(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> PropertyChild:
        pass

    @abstractmethod
    async def get_document_requirements_for_given_property_parent_partner(
        self, property_id: UUID, partner_id: UUID
    ) -> List[PropertyParentDocumentRequirement]:
        pass


class PropertyManagementSvc(IPropertyManagementSvc):
    def __init__(
        self, repo: IPropertyManagementRepo, identity_client: IIdentityClient
    ) -> None:
        self.repo = repo
        self.identity_client = identity_client

    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[Property]:
        return await self.repo.get_all_properties(
            page_size=page_size, page_number=page_number
        )

    async def get_all_property_children(
        self,
        property_id: str,
    ) -> List[PropertyChild]:
        return await self.repo.get_all_property_children(property_id=property_id)

    async def get_document_requirements_for_given_property_parent(
        self, property_id: str, user_id: str
    ) -> List[PropertyParentDocumentRequirement]:
        async with asyncio.TaskGroup() as tg:
            all_req_task = tg.create_task(
                self.repo.get_all_property_parent_document_requirements(
                    property_id=property_id
                )
            )
            condition_keys_task = tg.create_task(
                self.identity_client.get_parent_condition_keys(user_id=user_id)
            )
        all_req = all_req_task.result()
        condition_keys = condition_keys_task.result()
        active_reqs: List[PropertyParentDocumentRequirement] = []
        for req in all_req:
            if self._is_parent_requirement_active(condition_keys, req):
                active_reqs.append(req)
        return active_reqs

    async def get_all_property_children_for_given_parent(
        self, property_id: str, parent_id: str
    ) -> List[PropertyChild]:
        async with asyncio.TaskGroup() as tg:
            prop_children_task = tg.create_task(
                self.get_all_property_children(property_id=property_id)
            )
            parent_children_task = tg.create_task(
                self.identity_client.get_all_parent_children(parent_id=parent_id)
            )
        prop_children = prop_children_task.result()
        parent_children = parent_children_task.result()
        parent_child_ids = {x.child_id for x in parent_children}
        return [pc for pc in prop_children if pc.child_id in parent_child_ids]

    async def get_document_requirements_for_given_property_child(
        self,
        property_id: str,
        child_id: str,
    ) -> List[PropertyChildDocumentRequirement]:
        async with asyncio.TaskGroup() as tg:
            all_req_task = tg.create_task(
                self.repo.get_all_property_children_document_requirements(property_id)
            )
            condition_key_task = tg.create_task(
                self.identity_client.get_child_condition_keys(child_id)
            )
        all_req = all_req_task.result()
        condition_keys = condition_key_task.result()
        active_reqs: List[PropertyChildDocumentRequirement] = []
        for req in all_req:
            if self._is_child_requirement_active(condition_keys, req):
                active_reqs.append(req)
        return active_reqs

    async def get_all_property_children_paged(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyChild]:
        return await self.repo.get_all_property_children_paged(
            property_id=property_id, page_size=page_size, page_number=page_number
        )

    async def get_point_value_for_given_property_parent_document_by_document_type(
        self,
        property_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> int:
        return await self.repo.get_point_value_for_given_property_parent_document_by_document_type(
            property_id=property_id,
            document_type=document_type,
        )

    async def increment_property_children_points_for_given_parent(
        self,
        property_id: UUID,
        children_ids: List[UUID],
        point_value: int,
    ) -> List[PropertyChild]:
        return await self.repo.increment_property_children_points_for_given_parent(
            property_id=property_id, point_value=point_value, children_ids=children_ids
        )

    async def get_point_value_for_given_property_child_document_by_document_type(
        self,
        property_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> int:
        return await self.repo.get_point_value_for_given_property_child_document_by_document_type(
            property_id=property_id,
            document_type=document_type,
        )

    async def get_property_child_by_id(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> PropertyChild:
        return await self.repo.get_property_child_by_id(
            property_id=property_id, child_id=child_id
        )

    async def get_document_requirements_for_given_property_parent_partner(
        self, property_id: UUID, partner_id: UUID
    ) -> List[PropertyParentDocumentRequirement]:
        async with asyncio.TaskGroup() as tg:
            all_req_task = tg.create_task(
                self.repo.get_all_property_parent_document_requirements(
                    property_id=property_id
                )
            )
            condition_keys_task = tg.create_task(
                self.identity_client.get_parent_partner_condition_keys(
                    partner_id=partner_id
                )
            )
        all_req = all_req_task.result()
        condition_keys = condition_keys_task.result()
        active_reqs: List[PropertyParentDocumentRequirement] = []
        for req in all_req:
            if self._is_parent_requirement_active(condition_keys, req):
                active_reqs.append(req)
        return active_reqs

    def _is_parent_requirement_active(
        self,
        cK: ParentConditionKeys,
        r: PropertyParentDocumentRequirement,
    ) -> bool:
        if r.requirement_type == REQUIREMENT_TYPE.always:
            return True

        if r.requirement_type == REQUIREMENT_TYPE.conditional:
            match r.condition_key:
                case CONDITION_KEY.is_employed:
                    return cK.is_employed
                case CONDITION_KEY.is_self_employed:
                    return cK.is_self_employed
                case CONDITION_KEY.is_student:
                    return cK.is_student
                case CONDITION_KEY.filed_tax_in_desired_location:
                    return cK.filed_tax_in_desired_location
                case CONDITION_KEY.resides_in_desired_location:
                    return cK.resides_in_desired_location
                case _:
                    return False
        return False

    def _is_child_requirement_active(
        self,
        cK: ChildConditionKeys,
        r: PropertyChildDocumentRequirement,
    ) -> bool:
        if r.requirement_type == REQUIREMENT_TYPE.always:
            return True

        if r.requirement_type == REQUIREMENT_TYPE.conditional:
            match r.condition_key:
                case CHILD_CONDITION_KEY.has_disability:
                    return cK.has_disability
                case CHILD_CONDITION_KEY.is_from_single_parent_family:
                    return cK.is_from_single_parent_family
                case _:
                    return False
        return False
