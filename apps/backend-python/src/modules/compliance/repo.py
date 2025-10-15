from typing import List
from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
)
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.pagination import calculate_offset, new_paged_response
from src.shared.utils.query import try_except


class IComplianceRepo(ABC):
    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: str,
        user_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocument]]:
        pass

    @abstractmethod
    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: str,
        user_id: str,
        parent_doc_id: str,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyParentDocument]]:
        pass

    @abstractmethod
    async def send_property_parent_document_approval_request(
        self,
        property_id: str,
        user_id: str,
        parent_document_id: str,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
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

    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: str,
        child_id: str,
    ) -> HTTPErrorResponse[List[PropertyChildDocument]]:
        sql = """
          SELECT *
          FROM compliance.property_children_documents
          WHERE property_id = $1 AND child_id = $2;
          """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id, child_id)
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            return [PropertyChildDocument(**row) for row in rows], None

    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: str,
        user_id: str,
        parent_doc_id: str,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        sql = """
          SELECT *
          FROM compliance.property_parent_documents
          WHERE property_id = $1 AND user_id = $2 AND parent_document_id = $3;
          """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch, sql, property_id, user_id, parent_doc_id
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            if len(rows) == 0:
                return None, HTTPError(
                    code=404,
                    message=f"Parent document request with id: {parent_doc_id} was not found!",
                )
            return PropertyParentDocument(**rows[0]), None

    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: str,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyParentDocument]]:
        sql = """
        SELECT
          *,
          COUNT(*) OVER() AS total_count
        FROM compliance.property_parent_documents
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
                calculate_offset(page_size=page_size, page_number=page_number),
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            if len(rows) == 0:
                return (
                    new_paged_response(items=[], total=0, page_size=1, page_number=1),
                    None,
                )
            total_count = rows[0]["total_count"]
            return (
                new_paged_response(
                    items=[PropertyParentDocument(**row) for row in rows],
                    total=total_count,
                    page_size=page_size,
                    page_number=page_size,
                ),
                None,
            )

    async def send_property_parent_document_approval_request(
        self,
        property_id: str,
        user_id: str,
        parent_document_id: str,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        sql = """
        INSERT INTO compliance.property_parent_documents(
            property_id,
            user_id,
            parent_document_id
        ) VALUES (
            $1,
            $2,
            $3
        ) RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow, sql, property_id, user_id, parent_document_id
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            if row is None:
                return None, HTTPError(
                    code=404,
                    message=f"Approval request: {parent_document_id} was not saved successfully!",
                )
            return PropertyParentDocument(**row), None
