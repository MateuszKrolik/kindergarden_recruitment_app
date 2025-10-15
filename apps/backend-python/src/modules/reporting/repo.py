from abc import ABC, abstractmethod
from uuid import UUID
from asyncpg import Pool
from src.shared.types.modules.reporting.enum import DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import ParentDocument
from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.query import try_except


class IReportingRepo(ABC):
    @abstractmethod
    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[ParentDocument]:
        pass


class ReportingRepo(IReportingRepo):
    def __init__(self, pool: Pool) -> None:
        self.pool = pool

    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[ParentDocument]:
        sql = """
        SELECT *
        FROM reporting.parent_documents
        WHERE user_id = $1 AND document_type = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch, sql, user_id, document_type
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            if len(rows) == 0:
                return None, HTTPError(
                    code=404,
                    message=f"Document with type: ${document_type} does not exist for parent: {user_id}!",
                )
            return ParentDocument(**rows[0]), None
