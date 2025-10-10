from abc import ABC, abstractmethod
from src.modules.property_management.model import Property
from src.modules.property_management.repo import IPropertyManagementRepo
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPErrorResponse


class IPropertyManagementSvc(ABC):
    @abstractmethod
    async def get_all_properties(
        self,
        pageSize: int,
        pageNumber: int,
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        pass


class PropertyManagementSvc(IPropertyManagementSvc):
    def __init__(self, repo: IPropertyManagementRepo) -> None:
        self.repo = repo

    async def get_all_properties(
        self,
        pageSize: int,
        pageNumber: int,
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        return await self.repo.get_all_properties(
            page_size=pageSize, page_number=pageNumber
        )
