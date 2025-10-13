from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.types.modules.identity.model import ParentConditionKeys, PropertyUser
from src.shared.types.response import HTTPError, HTTPErrorResponse


class IIdentityRepo(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
        pass

    @abstractmethod
    async def get_property_user(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[PropertyUser]:
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

    async def get_property_user(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[PropertyUser]:
        async with self.pool.acquire() as connection:
            sql = """
            SELECT *
            FROM identity.property_users
            WHERE property_id = $1 AND user_id = $2;
            """
            try:
                rows = await connection.fetch(sql, property_id, user_id)
                if len(rows) == 0:
                    return None, HTTPError(
                        code=404,
                        message=f"User: {user_id} is not registered to property: {property_id}!",
                    )
                data = PropertyUser(**rows[0])
                return data, None
            except Exception as e:
                return None, HTTPError(code=500, message=str(e))
