from typing import List
from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.types.modules.identity.model import (
    ParentChild,
    ParentConditionKeys,
    PropertyUser,
)
from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.query import try_except


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

    @abstractmethod
    async def get_all_parent_children(
        self,
        parent_id: str,
    ) -> HTTPErrorResponse[List[ParentChild]]:
        pass


class IdentityRepo(IIdentityRepo):
    def __init__(self, pool: Pool):
        self.pool = pool

    async def get_parent_condition_keys(
        self,
        user_id: str,
    ) -> HTTPErrorResponse[ParentConditionKeys]:
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
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, user_id)
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            if len(rows) == 0:
                return None, HTTPError(
                    code=404, message=f"Parent with id: {user_id} does not exist!"
                )
            keys = ParentConditionKeys(**rows[0])
            return keys, None

    async def get_property_user(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[PropertyUser]:
        sql = """
        SELECT *
        FROM identity.property_users
        WHERE property_id = $1 AND user_id = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id, user_id)
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            if len(rows) == 0:
                return None, HTTPError(
                    code=404,
                    message=f"User: {user_id} is not registered to property: {property_id}!",
                )
            data = PropertyUser(**rows[0])
            return data, None

    async def get_all_parent_children(
        self,
        parent_id: str,
    ) -> HTTPErrorResponse[List[ParentChild]]:
        sql = """
        SELECT *
        FROM identity.parent_children
        WHERE parent_id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, parent_id)
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            return [ParentChild(**row) for row in rows], None
