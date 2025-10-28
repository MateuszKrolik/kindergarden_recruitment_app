from abc import ABC, abstractmethod
from uuid import UUID
from asyncpg import Pool
from src.shared.exceptions.not_found import NotFoundException
from src.shared.exceptions.database import DatabaseException
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.modules.reporting.model import (
    ChildDocument,
    ParentDocument,
    ParentPartnerDocument,
)
from src.shared.utils.query import try_except


class IReportingRepo(ABC):
    @abstractmethod
    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> [ParentDocument]:
        pass

    @abstractmethod
    async def get_parent_document_file_path_by_document_id(
        self,
        doc_id: UUID,
    ) -> str:
        pass

    @abstractmethod
    async def save_parent_document(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
        file_path: str,
    ) -> ParentDocument:
        pass

    @abstractmethod
    async def get_child_document_by_type(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> ChildDocument:
        pass

    @abstractmethod
    async def save_child_document(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        file_path: str,
    ) -> ChildDocument:
        pass

    @abstractmethod
    async def get_child_document_file_path_by_document_id(
        self,
        doc_id: UUID,
    ) -> str:
        pass

    @abstractmethod
    async def get_parent_partner_document_by_type(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> ParentPartnerDocument:
        pass

    @abstractmethod
    async def save_parent_partner_document(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
        file_path: str,
    ) -> ParentPartnerDocument:
        pass


class ReportingRepo(IReportingRepo):
    def __init__(self, pool: Pool) -> None:
        self.pool = pool

    async def get_parent_document_by_type(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> ParentDocument:
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
                raise DatabaseException(message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Document with type: ${document_type} does not exist for parent: {user_id}!",
                )
            return ParentDocument(**rows[0])

    async def get_parent_document_file_path_by_document_id(
        self,
        doc_id: UUID,
    ) -> str:
        sql = """
        SELECT file_path
        FROM reporting.parent_documents
        WHERE id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, doc_id)
            if error:
                raise DatabaseException(message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Parent document with id: {doc_id} was not found!",
                )
            return rows[0]["file_path"]

    async def save_parent_document(
        self,
        user_id: UUID,
        document_type: DOCUMENT_TYPE,
        file_path: str,
    ) -> ParentDocument:
        sql = """
        INSERT INTO reporting.parent_documents(
          user_id,
          document_type,
          file_path)
        VALUES ($1, $2, $3)
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow, sql, user_id, document_type, file_path
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Document: ${document_type} was not saved successfully for parent: ${user_id}!",
                )
            return ParentDocument(**row)

    async def get_child_document_by_type(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> ChildDocument:
        sql = """
        SELECT *
        FROM reporting.children_documents
        WHERE child_id = $1 AND document_type = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch, sql, child_id, document_type
            )
            if error:
                raise DatabaseException(code=500, message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Document with type: ${document_type} does not exist for child: {child_id}!",
                )
            return ChildDocument(**rows[0])

    async def save_child_document(
        self,
        child_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        file_path: str,
    ) -> ChildDocument:
        sql = """
        INSERT INTO reporting.children_documents(
          child_id,
          document_type,
          file_path)
        VALUES ($1, $2, $3)
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow, sql, child_id, document_type, file_path
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Document: ${document_type} was not saved successfully for child: ${child_id}!",
                )
            return ChildDocument(**row)

    async def get_child_document_file_path_by_document_id(
        self,
        doc_id: UUID,
    ) -> str:
        sql = """
        SELECT file_path
        FROM reporting.children_documents
        WHERE id = $1;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, doc_id)
            if error:
                raise DatabaseException(message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Child document with id: {doc_id} was not found!",
                )
            return rows[0]["file_path"]

    async def get_parent_partner_document_by_type(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> ParentPartnerDocument:
        sql = """
        SELECT *
        FROM reporting.parent_partner_documents
        WHERE partner_id = $1 AND document_type = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch, sql, partner_id, document_type
            )
            if error:
                raise DatabaseException(message=str(error))
            if len(rows) == 0:
                raise NotFoundException(
                    message=f"Document with type: ${document_type} does not exist for parent partner: {partner_id}!",
                )
            return ParentPartnerDocument(**rows[0])

    async def save_parent_partner_document(
        self,
        partner_id: UUID,
        document_type: DOCUMENT_TYPE,
        file_path: str,
    ) -> ParentPartnerDocument:
        sql = """
        INSERT INTO reporting.parent_partner_documents(
          partner_id,
          document_type,
          file_path)
        VALUES ($1, $2, $3)
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow, sql, partner_id, document_type, file_path
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Document: ${document_type} was NOT saved successfully for parent partner: ${partner_id}!",
                )
            return ParentPartnerDocument(**row)
