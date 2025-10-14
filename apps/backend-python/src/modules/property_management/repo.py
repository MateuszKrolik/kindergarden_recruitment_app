from abc import ABC, abstractmethod
from typing import List
import asyncpg
from src.shared.types.modules.property_management.model import (
    Property,
    PropertyChild,
    PropertyChildDocumentRequirement,
    PropertyParentDocumentRequirement,
)
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.pagination import calculate_offset, new_paged_response
from src.shared.utils.query import try_except


class IPropertyManagementRepo(ABC):
    @abstractmethod
    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        pass

    @abstractmethod
    async def get_all_property_parent_document_requirements(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocumentRequirement]]:
        pass

    @abstractmethod
    async def get_all_property_children(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyChild]]:
        pass

    @abstractmethod
    async def get_all_property_children_document_requirements(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocumentRequirement]]:
        pass

    @abstractmethod
    async def get_all_property_children_paged(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyChild]]:
        pass


class PropertyManagementRepo(IPropertyManagementRepo):
    def __init__(self, pool: asyncpg.Pool) -> None:
        self.pool = pool

    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        sql = """
        SELECT 
          *,
          COUNT(*) OVER() as total_count
        FROM property_management.properties
        LIMIT $1
        OFFSET $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch,
                sql,
                page_size,
                calculate_offset(page_size, page_number),
            )
            if error:
                return (None, HTTPError(code=500, message=str(error)))
            if not rows:
                return (
                    new_paged_response(
                        items=[],
                        total=0,
                        page_number=page_number,
                        page_size=page_size,
                    ),
                    None,
                )

            total_count = rows[0]["total_count"]
            properties = [Property(**row) for row in rows]
            return (
                new_paged_response(
                    items=properties,
                    total=total_count,
                    page_number=page_number,
                    page_size=page_size,
                ),
                None,
            )

    async def get_all_property_parent_document_requirements(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocumentRequirement]]:
        sql = """
          SELECT *
          FROM property_management.property_parent_document_requirements
          WHERE property_id = $1;
          """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id)
            if error:
                return (None, HTTPError(code=500, message=str(error)))
            assert rows is not None
            requirements = [
                PropertyParentDocumentRequirement(**dict(row)) for row in rows
            ]
            return requirements, None

    async def get_all_property_children(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyChild]]:
        sql = """
        SELECT *
        FROM property_management.property_children
        WHERE property_id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id)
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            result = [PropertyChild(**row) for row in rows]
            return result, None

    async def get_all_property_children_document_requirements(
        self,
        property_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocumentRequirement]]:
        sql = """
        SELECT *
        FROM property_management.property_children_document_requirements
        WHERE property_id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id)
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            return [PropertyChildDocumentRequirement(**row) for row in rows], None

    async def get_all_property_children_paged(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyChild]]:
        sql = """
        SELECT 
          *,
          COUNT(*) OVER() as total_count
        FROM property_management.property_children
        WHERE property_id = $1
        LIMIT $2
        OFFSET $3;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch,
                sql,
                property_id,
                page_size,
                calculate_offset(page_size=page_size, page_number=page_size),
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            if len(rows) == 0:
                return (
                    new_paged_response(
                        [], 0, page_number=page_number, page_size=page_size
                    ),
                    None,
                )
            total_count = rows[0]["total_count"]
            return (
                new_paged_response(
                    items=[PropertyChild(**row) for row in rows],
                    total=total_count,
                    page_size=page_size,
                    page_number=page_number,
                ),
                None,
            )
