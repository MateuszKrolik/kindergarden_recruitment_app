from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentChild,
    ParentConditionKeys,
)
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
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


class IReportingClient(ABC):
    @abstractmethod
    async def get_parent_document_type_by_document_id(
        self,
        parent_document_id: UUID,
    ) -> HTTPErrorResponse[DOCUMENT_TYPE]:
        pass

    @abstractmethod
    async def get_child_document_type_by_document_id(
        self,
        child_document_id: UUID,
    ) -> HTTPErrorResponse[CHILD_DOCUMENT_TYPE]:
        pass
