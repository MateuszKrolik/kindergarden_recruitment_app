from abc import ABC, abstractmethod
from typing import List
from uuid import UUID
import asyncpg
from src.shared.exceptions.not_found import NotFoundException
from src.shared.exceptions.database import DatabaseException
from src.shared.types.modules.property_management.model import (
    Property,
    PropertyChild,
    PropertyChildDocumentRequirement,
    PropertyParentDocumentRequirement,
)
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.pagination import PagedResponse
from src.shared.utils.pagination import calculate_offset, new_paged_response
from src.shared.utils.query import try_except


class IPropertyManagementRepo(ABC):
    @abstractmethod
    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[Property]:
        pass

    @abstractmethod
    async def get_all_property_parent_document_requirements(
        self,
        property_id: str,
    ) -> List[PropertyParentDocumentRequirement]:
        pass

    @abstractmethod
    async def get_all_property_children(
        self,
        property_id: str,
    ) -> List[PropertyChild]:
        pass

    @abstractmethod
    async def get_all_property_children_document_requirements(
        self,
        property_id: str,
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
    async def increment_property_children_points_for_given_parent(
        self,
        property_id: UUID,
        children_ids: List[UUID],
        point_value: int,
    ) -> List[PropertyChild]:
        pass

    @abstractmethod
    async def get_point_value_for_given_property_child_document_by_document_type(
        self,
        property_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> int:
        pass

    @abstractmethod
    async def get_property_child_by_id(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> PropertyChild:
        pass


class PropertyManagementRepo(IPropertyManagementRepo):
    def __init__(self, pool: asyncpg.Pool) -> None:
        self.pool = pool

    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[Property]:
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
                raise DatabaseException(message=str(error))
            if not rows:
                return new_paged_response(
                    items=[],
                    total=0,
                    page_number=page_number,
                    page_size=page_size,
                )

            total_count = rows[0]["total_count"]
            properties = [Property(**row) for row in rows]
            return new_paged_response(
                items=properties,
                total=total_count,
                page_number=page_number,
                page_size=page_size,
            )

    async def get_all_property_parent_document_requirements(
        self,
        property_id: str,
    ) -> List[PropertyParentDocumentRequirement]:
        sql = """
          SELECT *
          FROM property_management.property_parent_document_requirements
          WHERE property_id = $1;
          """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id)
            if error:
                raise DatabaseException(message=str(error))
            requirements = [
                PropertyParentDocumentRequirement(**dict(row)) for row in rows
            ]
            return requirements

    async def get_all_property_children(
        self,
        property_id: str,
    ) -> List[PropertyChild]:
        sql = """
        SELECT *
        FROM property_management.property_children
        WHERE property_id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id)
            if error:
                raise DatabaseException(message=str(error))
            return [PropertyChild(**row) for row in rows]

    async def get_all_property_children_document_requirements(
        self,
        property_id: str,
    ) -> List[PropertyChildDocumentRequirement]:
        sql = """
        SELECT *
        FROM property_management.property_children_document_requirements
        WHERE property_id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id)
            if error:
                raise DatabaseException(message=str(error))
            return [PropertyChildDocumentRequirement(**row) for row in rows]

    async def get_all_property_children_paged(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyChild]:
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
                raise DatabaseException(message=str(error))
            if len(rows) == 0:
                return new_paged_response(
                    [], 0, page_number=page_number, page_size=page_size
                )
            total_count = rows[0]["total_count"]
            return new_paged_response(
                items=[PropertyChild(**row) for row in rows],
                total=total_count,
                page_size=page_size,
                page_number=page_number,
            )

    async def get_point_value_for_given_property_parent_document_by_document_type(
        self,
        property_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> int:
        sql = """
        SELECT point_value
        FROM property_management.property_parent_document_requirements
        WHERE property_id = $1 AND document_type = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch,
                sql,
                property_id,
                document_type,  # TODO: SQL index on document_type
            )
            if error:
                raise DatabaseException(message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Document type: ${document_type} not found in property: ${property_id}!",
                )
            return rows[0]["point_value"]

    async def increment_property_children_points_for_given_parent(
        self,
        property_id: UUID,
        children_ids: List[UUID],
        point_value: int,
    ) -> List[PropertyChild]:
        sql = """
        UPDATE property_management.property_children
        SET points = points + $1
        WHERE property_id = $2
        AND child_id = ANY($3::uuid[])
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch,
                sql,
                point_value,
                property_id,
                children_ids,
            )
            if error:
                raise DatabaseException(message=str(error))
            return [PropertyChild(**row) for row in rows]

    async def get_point_value_for_given_property_child_document_by_document_type(
        self,
        property_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> int:
        sql = """
        SELECT point_value
        FROM property_management.property_children_document_requirements
        WHERE property_id = $1 AND document_type = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch,
                sql,
                property_id,
                document_type,  # TODO: SQL index on document_type
            )
            if error:
                raise DatabaseException(code=500, message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Document type: ${document_type} not found in property: ${property_id}!",
                )
            return rows[0]["point_value"]

    async def get_property_child_by_id(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> PropertyChild:
        sql = """
        SELECT *
        FROM property_management.property_children
        WHERE property_id = $1 AND child_id = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id, child_id)
            if error:
                raise DatabaseException(message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Child with id {child_id} is not registered to property: {property_id}!",
                )
            return PropertyChild(**rows[0])
