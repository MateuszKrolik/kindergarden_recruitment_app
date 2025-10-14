import asyncio
from abc import ABC, abstractmethod
from typing import List, Set
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
    ParentChild,
    ParentConditionKeys,
)
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPErrorResponse


class IPropertyManagementSvc(ABC):
    @abstractmethod
    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        pass

    @abstractmethod
    async def get_document_requirements_for_given_property_parent(
        self, property_id: str, user_id: str
    ) -> HTTPErrorResponse[List[PropertyParentDocumentRequirement]]:
        pass

    @abstractmethod
    async def get_all_property_children_for_given_parent(
        self, property_id: str, parent_id: str
    ) -> HTTPErrorResponse[List[PropertyChild]]:
        pass

    @abstractmethod
    async def get_all_property_children(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyChild]]:
        pass

    @abstractmethod
    async def get_document_requirements_for_given_property_child(
        self,
        property_id: str,
        child_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocumentRequirement]]:
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
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        return await self.repo.get_all_properties(
            page_size=page_size, page_number=page_number
        )

    async def get_all_property_children(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyChild]]:
        return await self.repo.get_all_property_children(property_id=property_id)

    async def get_document_requirements_for_given_property_parent(
        self, property_id: str, user_id: str
    ) -> HTTPErrorResponse[List[PropertyParentDocumentRequirement]]:
        tasks = await asyncio.gather(
            self.repo.get_all_property_parent_document_requirements(
                property_id=property_id
            ),
            self.identity_client.get_parent_condition_keys(user_id=user_id),
        )
        all_req_task: HTTPErrorResponse[List[PropertyParentDocumentRequirement]] = (
            tasks[0]
        )
        all_req_task_result, error = all_req_task
        if error:
            return None, error
        assert all_req_task_result is not None
        condition_key_task: HTTPErrorResponse[ParentConditionKeys] = tasks[1]
        condition_key_task_result, error = condition_key_task
        if error:
            return None, error
        assert condition_key_task_result is not None
        active_reqs: List[PropertyParentDocumentRequirement] = []
        for req in all_req_task_result:
            if self._is_parent_requirement_active(condition_key_task_result, req):
                active_reqs.append(req)
        return active_reqs, None

    async def get_all_property_children_for_given_parent(
        self, property_id: str, parent_id: str
    ) -> HTTPErrorResponse[List[PropertyChild]]:
        tasks = await asyncio.gather(
            self.get_all_property_children(property_id=property_id),
            self.identity_client.get_all_parent_children(parent_id=parent_id),
        )
        prop_children_task: HTTPErrorResponse[List[PropertyChild]] = tasks[0]
        prop_children_task_result, error = prop_children_task
        if error:
            return None, error
        assert prop_children_task_result is not None
        parent_children_task: HTTPErrorResponse[List[ParentChild]] = tasks[1]
        parent_children_task_result, error = parent_children_task
        if error:
            return None, error
        assert parent_children_task_result is not None
        parent_child_ids: Set[UUID] = {x.child_id for x in parent_children_task_result}
        return [
            pc for pc in prop_children_task_result if pc.child_id in parent_child_ids
        ], None

    async def get_document_requirements_for_given_property_child(
        self,
        property_id: str,
        child_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocumentRequirement]]:
        tasks = await asyncio.gather(
            self.repo.get_all_property_children_document_requirements(property_id),
            self.identity_client.get_child_condition_keys(child_id),
        )
        all_req_task: HTTPErrorResponse[List[PropertyChildDocumentRequirement]] = tasks[
            0
        ]
        all_req_task_result, error = all_req_task
        if error:
            return None, error
        assert all_req_task_result is not None
        condition_key_task: HTTPErrorResponse[ChildConditionKeys] = tasks[1]
        condition_key_task_result, error = condition_key_task
        if error:
            return None, error
        assert condition_key_task_result is not None
        active_reqs: List[PropertyChildDocumentRequirement] = []
        for req in all_req_task_result:
            if self._is_child_requirement_active(condition_key_task_result, req):
                active_reqs.append(req)
        return active_reqs, None

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
                case _:
                    return False
        return False
