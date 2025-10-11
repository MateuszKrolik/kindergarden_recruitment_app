import asyncio
from abc import ABC, abstractmethod
from typing import List
from src.modules.property_management.client import IIdentityClient
from src.modules.property_management.enum import CONDITION_KEY, REQUIREMENT_TYPE
from src.modules.property_management.model import (
    Property,
    PropertyParentDocumentRequirement,
)
from src.modules.property_management.repo import IPropertyManagementRepo
from src.shared.types.modules.identity import ParentConditionKeys
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

    async def get_document_requirements_for_given_property_parent(
        self, propertyId: str, userId: str
    ) -> HTTPErrorResponse[List[PropertyParentDocumentRequirement]]:
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

    async def get_document_requirements_for_given_property_parent(
        self, property_id: str, user_id: str
    ) -> HTTPErrorResponse[List[PropertyParentDocumentRequirement]]:
        tasks = await asyncio.gather(
            self.repo.get_all_property_parent_document_requirements(
                property_id=property_id
            ),
            self.identity_client.get_parent_condition_keys(user_id=user_id),
            return_exceptions=True,
        )
        all_req_task: HTTPErrorResponse[List[PropertyParentDocumentRequirement]] = (
            tasks[0]
        )
        all_req_task_result, error = all_req_task
        if error:
            return None, error
        condition_key_task: HTTPErrorResponse[ParentConditionKeys] = tasks[1]
        condition_key_task_result, error = condition_key_task
        if error:
            return None, error
        active_reqs: List[PropertyParentDocumentRequirement] = []
        for req in all_req_task_result:
            if self._is_parent_requirement_active(condition_key_task_result, req):
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
