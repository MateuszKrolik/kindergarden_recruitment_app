from typing import List
from uuid import UUID
from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.exceptions.not_found import NotFoundException
from src.shared.exceptions.database import DatabaseException
from src.shared.types.modules.identity.model import (
    ChildConditionKeys,
    ParentConditionKeys,
    PropertyUser,
)
from src.shared.utils.query import try_except


class IIdentityRepo(ABC):
    @abstractmethod
    async def get_parent_condition_keys(
        self,
        user_id: UUID,
    ) -> ParentConditionKeys:
        pass

    @abstractmethod
    async def get_property_user(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> PropertyUser:
        pass

    @abstractmethod
    async def get_child_condition_keys(
        self,
        child_id: UUID,
    ) -> ChildConditionKeys:
        pass

    @abstractmethod
    async def get_parent_partner_condition_keys(
        self,
        partner_id: UUID,
    ) -> ParentConditionKeys:
        pass


class IdentityRepo(IIdentityRepo):
    def __init__(self, pool: Pool):
        self.pool = pool

    async def get_parent_condition_keys(
        self,
        user_id: UUID,
    ) -> ParentConditionKeys:
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
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException()
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Parent with id: {user_id} does not exist!"
                )
            return ParentConditionKeys(**rows[0])

    async def get_property_user(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> PropertyUser:
        sql = """
        SELECT *
        FROM identity.property_users
        WHERE property_id = $1 AND user_id = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id, user_id)
            if error:
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException(
                    message=f"User: {user_id} is not registered to property: {property_id}!",
                )
            return PropertyUser(**rows[0])

    async def get_child_condition_keys(
        self,
        child_id: UUID,
    ) -> ChildConditionKeys:
        sql = """
        SELECT
          has_disability,
          is_from_single_parent_family
          -- TODO
        FROM identity.children
        WHERE id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, child_id)
            if error:
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException(
                    message=f"Child with id: {child_id} does not exist!"
                )
            return ChildConditionKeys(**rows[0])

    async def get_parent_partner_condition_keys(
        self,
        partner_id: UUID,
    ) -> ParentConditionKeys:
        sql = """
        SELECT
          is_employed,
          is_self_employed,
          is_student,
          filed_tax_in_desired_location,
          resides_in_desired_location
        FROM identity.parent_partner_details
        WHERE partner_id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, partner_id)
            if error:
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException(
                    message=f"Partner with id: {partner_id} does not exist!"
                )
            return ParentConditionKeys(**rows[0])
