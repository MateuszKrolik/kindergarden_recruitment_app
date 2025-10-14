from typing import List
from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.types.modules.compliance.model import PropertyParentDocument
from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.query import try_except


class IComplianceRepo(ABC):
    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        pass


class ComplianceRepo(IComplianceRepo):
    def __init__(self, pool: Pool):
        self.pool = pool

    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        sql = """
        SELECT *
        FROM compliance.property_parent_documents
        WHERE property_id = $1 AND user_id = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id, user_id)
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            return [PropertyParentDocument(**row) for row in rows], None
