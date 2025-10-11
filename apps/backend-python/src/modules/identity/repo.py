from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.types.modules.identity import ParentConditionKeys
from src.shared.types.response import HTTPError, HTTPErrorResponse


class IIdentityRepo(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        pass


class IdentityRepo(IIdentityRepo):
    def __init__(self, pool: Pool):
        self.pool = pool

    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        async with self.pool.acquire() as connection:
            sql = """
            SELECT
              is_employed,
              is_self_employed,
              is_student,
              filed_tax_in_desired_location,
              resides_in_desired_location
            FROM identity.parent_user_details
            WHERE user_id = $1;
            """
            try:
                rows = await connection.fetch(sql, user_id)
                if len(rows) == 0:
                    return None, HTTPError(
                        code=404, message=f"Parent with id: {user_id} does not exist!"
                    )
                keys = ParentConditionKeys(**rows[0])
                return keys, None
            except Exception as e:
                return None, HTTPError(code=500, message=str(e))
