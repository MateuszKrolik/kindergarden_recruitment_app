from typing import List, Optional
from uuid import UUID

from asyncpg import Pool
from abc import ABC, abstractmethod

from src.shared.exceptions.not_found import NotFoundException
from src.shared.exceptions.database import DatabaseException
from src.shared.types.modules.compliance.enum import REQUEST_STATUS
from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
    PropertyParentPartnerDocument,
)
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE
from src.shared.types.pagination import PagedResponse
from src.shared.utils.pagination import calculate_offset, new_paged_response
from src.shared.utils.query import try_except


class IComplianceRepo(ABC):
    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> List[PropertyParentDocument]:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> List[PropertyChildDocument]:
        pass

    @abstractmethod
    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_doc_id: UUID,
    ) -> PropertyParentDocument:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyParentDocument]:
        pass

    @abstractmethod
    async def send_property_parent_document_approval_request(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        document_type: DOCUMENT_TYPE,
        point_value: int,
        # REQUESTOR DATA
        requestor_id: UUID,
        requestor_name: str,
        requestor_email: str,
    ) -> PropertyParentDocument:
        pass

    @abstractmethod
    async def set_property_parent_document_request_status(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        request_status: REQUEST_STATUS,
        # APPROVER DATA
        admin_id: UUID,
        admin_name: str,
        admin_email: str,
        rejection_reason: Optional[str] = None,
    ) -> PropertyParentDocument:
        pass

    @abstractmethod
    async def get_all_child_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyChildDocument]:
        pass

    @abstractmethod
    async def send_property_child_document_approval_request(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        point_value: int,
        # REQUESTOR DATA
        requestor_id: UUID,
        requestor_name: str,
        requestor_email: str,
    ) -> PropertyChildDocument:
        pass

    @abstractmethod
    async def get_property_child_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
    ) -> PropertyChildDocument:
        pass

    @abstractmethod
    async def set_property_child_document_request_status(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        request_status: REQUEST_STATUS,
        # APPROVER DATA
        admin_id: UUID,
        admin_name: str,
        admin_email: str,
        rejection_reason: Optional[str] = None,
    ) -> PropertyChildDocument:
        pass

    @abstractmethod
    async def send_property_parent_partner_document_approval_request(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        document_type: DOCUMENT_TYPE,
        point_value: int,
        # REQUESTOR DATA
        requestor_id: UUID,
        requestor_name: str,
        requestor_email: str,
    ) -> PropertyParentPartnerDocument:
        pass

    @abstractmethod
    async def get_all_document_approval_requests_for_given_property_parent_partner(
        self,
        property_id: UUID,
        partner_id: UUID,
    ) -> List[PropertyParentPartnerDocument]:
        pass

    @abstractmethod
    async def get_property_parent_partner_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
    ) -> PropertyParentPartnerDocument:
        pass

    @abstractmethod
    async def get_all_partner_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyParentPartnerDocument]:
        pass

    @abstractmethod
    async def set_property_parent_partner_document_request_status(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        request_status: REQUEST_STATUS,
        # APPROVER DATA
        admin_id: UUID,
        admin_name: str,
        admin_email: str,
        rejection_reason: Optional[str] = None,
    ) -> PropertyParentPartnerDocument:
        pass


class ComplianceRepo(IComplianceRepo):
    def __init__(self, pool: Pool):
        self.pool = pool

    async def get_all_document_approval_requests_for_given_property_parent(
        self,
        property_id: UUID,
        user_id: UUID,
    ) -> List[PropertyParentDocument]:
        sql = """
        SELECT *
        FROM compliance.property_parent_documents
        WHERE property_id = $1 AND user_id = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id, user_id)
            if error:
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException()
            return [PropertyParentDocument(**row) for row in rows]

    async def get_all_document_approval_requests_for_given_property_child(
        self,
        property_id: UUID,
        child_id: UUID,
    ) -> List[PropertyChildDocument]:
        sql = """
          SELECT *
          FROM compliance.property_children_documents
          WHERE property_id = $1 AND child_id = $2;
          """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(connection.fetch, sql, property_id, child_id)
            if error:
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException()
            return [PropertyChildDocument(**row) for row in rows]

    async def get_property_parent_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_doc_id: UUID,
    ) -> PropertyParentDocument:
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
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException(
                    message=f"Parent document request with id: {parent_doc_id} was not found!",
                )
            return PropertyParentDocument(**rows[0])

    async def get_all_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyParentDocument]:
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
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                return new_paged_response(items=[], total=0, page_size=1, page_number=1)
            total_count = rows[0]["total_count"]
            return new_paged_response(
                items=[PropertyParentDocument(**row) for row in rows],
                total=total_count,
                page_size=page_size,
                page_number=page_size,
            )

    async def send_property_parent_document_approval_request(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        document_type: DOCUMENT_TYPE,
        point_value: int,
        # REQUESTOR DATA
        requestor_id: UUID,
        requestor_name: str,
        requestor_email: str,
    ) -> PropertyParentDocument:
        sql = """
        INSERT INTO compliance.property_parent_documents(
            property_id,
            user_id,
            parent_document_id,
            document_type,
            point_value,
            -- REQUESTOR DATA
            requestor_id,
            requestor_name,
            requestor_email
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            -- REQUESTOR DATA
            $6,
            $7,
            $8
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
                point_value,
                # REQUESTOR DATA
                requestor_id,
                requestor_name,
                requestor_email,
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Approval request: {parent_document_id} was not saved successfully!",
                )
            return PropertyParentDocument(**row)

    async def set_property_parent_document_request_status(
        self,
        property_id: UUID,
        user_id: UUID,
        parent_document_id: UUID,
        request_status: REQUEST_STATUS,
        # APPROVER DATA
        admin_id: UUID,
        admin_name: str,
        admin_email: str,
        rejection_reason: Optional[str] = None,
    ) -> PropertyParentDocument:
        sql = """
        UPDATE compliance.property_parent_documents
        SET request_status = $1, approved_by = $2, approved_by_name = $3, approved_by_email = $4, rejection_reason = $5 
        WHERE property_id = $6 AND user_id = $7 AND parent_document_id = $8
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                request_status,
                # APPROVER DATA
                admin_id,
                admin_name,
                admin_email,
                rejection_reason,
                # APPROVER DATA
                property_id,
                user_id,
                parent_document_id,
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Parent document request: ${parent_document_id} was not found!",
                )
            return PropertyParentDocument(**row)

    async def get_all_child_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyChildDocument]:
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
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                return new_paged_response(items=[], total=0, page_size=1, page_number=1)
            total_count = rows[0]["total_count"]
            return new_paged_response(
                items=[PropertyChildDocument(**row) for row in rows],
                total=total_count,
                page_size=page_size,
                page_number=page_size,
            )

    async def send_property_child_document_approval_request(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        document_type: CHILD_DOCUMENT_TYPE,
        point_value: int,
        # REQUESTOR DATA
        requestor_id: UUID,
        requestor_name: str,
        requestor_email: str,
    ) -> PropertyChildDocument:
        sql = """
        INSERT INTO compliance.property_children_documents(
            property_id,
            child_id,
            child_document_id,
            document_type,
            point_value,
            -- REQUESTOR DATA
            requestor_id,
            requestor_name,
            requestor_email
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            -- REQUESTOR DATA
            $6,
            $7,
            $8
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
                point_value,
                requestor_id,
                requestor_name,
                requestor_email,
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Approval request: {child_document_id} was not saved successfully!",
                )
            return PropertyChildDocument(**row)

    async def get_property_child_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
    ) -> PropertyChildDocument:
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
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException(
                    message=f"Child document request with id: {child_document_id} was not found!",
                )
            return PropertyChildDocument(**rows[0])

    async def set_property_child_document_request_status(
        self,
        property_id: UUID,
        child_id: UUID,
        child_document_id: UUID,
        request_status: REQUEST_STATUS,
        # APPROVER DATA
        admin_id: UUID,
        admin_name: str,
        admin_email: str,
        rejection_reason: Optional[str] = None,
    ) -> PropertyChildDocument:
        sql = """
        UPDATE compliance.property_children_documents
        SET request_status = $1, approved_by = $2, approved_by_name = $3, approved_by_email = $4, rejection_reason = $5 
        WHERE property_id = $6 AND child_id = $7 AND child_document_id = $8
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                request_status,
                # APPROVER DATA
                admin_id,
                admin_name,
                admin_email,
                rejection_reason,
                # APPROVER DATA
                property_id,
                child_id,
                child_document_id,
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Child document request: ${child_document_id} was not found!",
                )
            return PropertyChildDocument(**row)

    async def send_property_parent_partner_document_approval_request(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        document_type: DOCUMENT_TYPE,
        point_value: int,
        # REQUESTOR DATA
        requestor_id: UUID,
        requestor_name: str,
        requestor_email: str,
    ) -> PropertyParentPartnerDocument:
        sql = """
        INSERT INTO compliance.property_parent_partner_documents(
            property_id,
            partner_id,
            parent_partner_document_id,
            document_type,
            point_value,
            -- REQUESTOR DATA
            requestor_id,
            requestor_name,
            requestor_email
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            -- REQUESTOR DATA
            $6,
            $7,
            $8
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
                point_value,
                # REQUESTOR DATA
                requestor_id,
                requestor_name,
                requestor_email,
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Approval request: {parent_partner_document_id} was NOT saved successfully!",
                )
            return PropertyParentPartnerDocument(**row)

    async def get_all_document_approval_requests_for_given_property_parent_partner(
        self,
        property_id: UUID,
        partner_id: UUID,
    ) -> List[PropertyParentPartnerDocument]:
        sql = """
        SELECT *
        FROM compliance.property_parent_partner_documents
        WHERE property_id = $1 AND partner_id = $2;
        """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch, sql, property_id, partner_id
            )
            if error:
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException
            return [PropertyParentPartnerDocument(**row) for row in rows]

    async def get_property_parent_partner_document_approval_request_by_document_id(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
    ) -> PropertyParentPartnerDocument:
        sql = """
          SELECT *
          FROM compliance.property_parent_partner_documents
          WHERE property_id = $1 AND partner_id = $2 AND parent_partner_document_id = $3;
          """
        async with self.pool.acquire() as connection:
            rows, error = await try_except(
                connection.fetch,
                sql,
                property_id,
                partner_id,
                parent_partner_document_id,
            )
            if error:
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                raise NotFoundException(
                    message=f"Partner document request with id: {parent_partner_document_id} was not found!",
                )
            return PropertyParentPartnerDocument(**rows[0])

    async def get_all_partner_document_approval_requests_for_given_property(
        self,
        property_id: UUID,
        page_size: int,
        page_number: int,
    ) -> PagedResponse[PropertyParentPartnerDocument]:
        sql = """
        SELECT
          *,
          COUNT(*) OVER() AS total_count
        FROM compliance.property_parent_partner_documents
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
                raise DatabaseException(message=str(error))
            if rows is None or len(rows) == 0:
                return new_paged_response(items=[], total=0, page_size=1, page_number=1)
            total_count = rows[0]["total_count"]
            return new_paged_response(
                items=[PropertyParentPartnerDocument(**row) for row in rows],
                total=total_count,
                page_size=page_size,
                page_number=page_size,
            )

    async def set_property_parent_partner_document_request_status(
        self,
        property_id: UUID,
        partner_id: UUID,
        parent_partner_document_id: UUID,
        request_status: REQUEST_STATUS,
        # APPROVER DATA
        admin_id: UUID,
        admin_name: str,
        admin_email: str,
        rejection_reason: Optional[str] = None,
    ) -> PropertyParentPartnerDocument:
        sql = """
        UPDATE compliance.property_parent_partner_documents
        SET request_status = $1, approved_by = $2, approved_by_name = $3, approved_by_email = $4, rejection_reason = $5 
        WHERE property_id = $6 AND partner_id = $7 AND parent_partner_document_id = $8
        RETURNING *;
        """
        async with self.pool.acquire() as connection:
            row, error = await try_except(
                connection.fetchrow,
                sql,
                request_status,
                # APPROVER DATA
                admin_id,
                admin_name,
                admin_email,
                rejection_reason,
                # APPROVER DATA
                property_id,
                partner_id,
                parent_partner_document_id,
            )
            if error:
                raise DatabaseException(message=str(error))
            if row is None:
                raise NotFoundException(
                    message=f"Partner document request: ${parent_partner_document_id} was not found!",
                )
            return PropertyParentPartnerDocument(**row)
