from abc import ABC, abstractmethod

from src.modules.identity.repo import IIdentityRepo
from src.shared.types.modules.identity import ParentConditionKeys
from src.shared.types.response import HTTPErrorResponse


class IIdentitySvc(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        pass


class IdentitySvc(IIdentitySvc):
    def __init__(self, repo: IIdentityRepo) -> None:
        self.repo = repo

    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        return await self.repo.get_parent_condition_keys(user_id)
