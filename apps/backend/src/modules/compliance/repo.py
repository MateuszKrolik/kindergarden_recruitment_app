from typing import List
from uuid import UUID
from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.types.modules.compliance.enum import REQUEST_STATUS
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
    PropertyParentPartnerDocument,
)
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.pagination import PagedResponse
from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.pagination import calculate_offset, new_paged_response
from src.shared.utils.query import try_except


class IComplianceRepo(ABC):
    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyParentDocument]]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> HTTPErrorResponse[List[PropertyChildDocument]]:
        pass

    @abstractmethod
    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_doc_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyParentDocument]]:
        pass

    @abstractmethod
    async def send_property_parent_document_approval_request(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def set_property_parent_document_request_status(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def get_all_child_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyChildDocument]]:
        pass

    @abstractmethod
    async def send_property_child_document_approval_request(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        pass

    @abstractmethod
    async def get_property_child_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        pass

    @abstractmethod
    async def set_property_child_document_request_status(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        pass

    @abstractmethod
    async def send_property_parent_partner_document_approval_request(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentPartnerDocument]:
        pass


class ComplianceRepo(IComplianceRepo):
    def __init__(self, pool: Pool):
        self.pool = pool

    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: UUID,
        user_id: UUID,
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
        property_id: UUID,
        child_id: UUID,
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
        property_id: UUID,
        user_id: UUID,
        parent_doc_id: UUID,
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
        property_id: UUID,
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
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        sql = """
        INSERT INTO compliance.property_parent_documents(
            property_id,
            user_id,
            parent_document_id,
            document_type
        ) VALUES (
            $1,
            $2,
            $3,
            $4
        ) RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                property_id,
                user_id,
                parent_document_id,
                document_type,
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            if row is None:
                return None, HTTPError(
                    code=404,
                    message=f"Approval request: {parent_document_id} was not saved successfully!",
                )
            return PropertyParentDocument(**row), None

    async def set_property_parent_document_request_status(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyParentDocument]:
        sql = """
        UPDATE compliance.property_parent_documents
        SET request_status = $1, approved_by = $2
        WHERE property_id = $3 AND user_id = $4 AND parent_document_id = $5
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                request_status,
                admin_id,
                property_id,
                user_id,
                parent_document_id,
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            if row is None:
                return None, HTTPError(
                    code=404,
                    message=f"Parent document request: ${parent_document_id} was not found!",
                )
            return PropertyParentDocument(**row), None

    async def get_all_child_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> HTTPErrorResponse[PagedResponse[PropertyChildDocument]]:
        sql = """
        SELECT
          *,
          COUNT(*) OVER() AS total_count
        FROM compliance.property_children_documents
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
                    items=[PropertyChildDocument(**row) for row in rows],
                    total=total_count,
                    page_size=page_size,
                    page_number=page_size,
                ),
                None,
            )

    async def send_property_child_document_approval_request(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        sql = """
        INSERT INTO compliance.property_children_documents(
            property_id,
            child_id,
            child_document_id,
            document_type
        ) VALUES (
            $1,
            $2,
            $3,
            $4
        ) RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                property_id,
                child_id,
                child_document_id,
                document_type,
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            if row is None:
                return None, HTTPError(
                    code=404,
                    message=f"Approval request: {child_document_id} was not saved successfully!",
                )
            return PropertyChildDocument(**row), None

    async def get_property_child_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        sql = """
          SELECT *
          FROM compliance.property_children_documents
          WHERE property_id = $1 AND child_id = $2 AND child_document_id = $3;
          """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch, sql, property_id, child_id, child_document_id
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            assert rows is not None
            if len(rows) == 0:
                return None, HTTPError(
                    code=404,
                    message=f"Child document request with id: {child_document_id} was not found!",
                )
            return PropertyChildDocument(**rows[0]), None

    async def set_property_child_document_request_status(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        request_status: REQUEST_STATUS,
        admin_id: UUID,
    ) -> HTTPErrorResponse[PropertyChildDocument]:
        sql = """
        UPDATE compliance.property_children_documents
        SET request_status = $1, approved_by = $2
        WHERE property_id = $3 AND child_id = $4 AND child_document_id = $5
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                request_status,
                admin_id,
                property_id,
                child_id,
                child_document_id,
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            if row is None:
                return None, HTTPError(
                    code=404,
                    message=f"Child document request: ${child_document_id} was not found!",
                )
            return PropertyChildDocument(**row), None

    async def send_property_parent_partner_document_approval_request(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        document_type: DOCUMENT_TYPE,
    ) -> HTTPErrorResponse[PropertyParentPartnerDocument]:
        sql = """
        INSERT INTO compliance.property_parent_partner_documents(
            property_id,
            partner_id,
            parent_partner_document_id,
            document_type
        ) VALUES (
            $1,
            $2,
            $3,
            $4
        ) RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                property_id,
                partner_id,
                parent_partner_document_id,
                document_type,
            )
            if error:
                return None, HTTPError(code=500, message=str(error))
            if row is None:
                return None, HTTPError(
                    code=404,
                    message=f"Approval request: {parent_partner_document_id} was not saved successfully!",
                )
            return PropertyParentPartnerDocument(**row), None
