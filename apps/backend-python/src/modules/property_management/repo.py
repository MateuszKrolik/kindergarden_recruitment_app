from abc import ABC, abstractmethod
import asyncpg
from src.modules.property_management.model import Property
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.pagination import calculate_offset, new_paged_response


class IPropertyManagementRepo(ABC):
    @abstractmethod
    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        pass


class PropertyManagementRepo(IPropertyManagementRepo):
    def __init__(self, pool: asyncpg.Pool) -> None:
        self.pool = pool

    async def get_all_properties(
        self,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[Property]]:
        async with self.pool.acquire() as connection:
            sql = """
            SELECT 
              *,
              COUNT(*) OVER() as total_count
            FROM property_management.properties
            LIMIT $1
            OFFSET $2;
            """
            try:
                rows = await connection.fetch(
                    sql, page_size, calculate_offset(page_size, page_number)
                )
            except Exception as e:
                return (None, HTTPError(code=500, message=str(e)))

            if not rows:
                return (
                    new_paged_response(
                        items=[], total=0, page_number=page_number, page_size=page_size
                    ),
                    None,
                )

            total_count = rows[0]["total_count"]
            properties = [Property(**dict(row)) for row in rows]
            return (
                new_paged_response(
                    items=properties,
                    total=total_count,
                    page_number=page_number,
                    page_size=page_size,
                ),
                None,
            )
