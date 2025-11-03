from typing import Optional
from uuid import UUID
from pydantic import BaseModel

from src.shared.types.modules.compliance.enum import REQUEST_STATUS
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE


class PropertyParentDocument(BaseModel):
    property_id: UUID
    user_id: UUID
    parent_document_id: UUID
    request_status: REQUEST_STATUS
    document_type: DOCUMENT_TYPE
    point_value: int
    # REQUESTOR DATA
    requestor_id: UUID
    requestor_name: str
    requestor_email: str
    # APPROVER DATA
    approved_by: Optional[UUID]
    approved_by_name: Optional[str]
    approved_by_email: Optional[str]
    rejection_reason: Optional[str]


class PropertyChildDocument(BaseModel):
    property_id: UUID
    child_id: UUID
    child_document_id: UUID
    request_status: REQUEST_STATUS
    document_type: CHILD_DOCUMENT_TYPE
    point_value: int
    # REQUESTOR DATA
    requestor_id: UUID
    requestor_name: str
    requestor_email: str
    # APPROVER DATA
    approved_by: Optional[UUID]
    approved_by_name: Optional[str]
    approved_by_email: Optional[str]
    rejection_reason: Optional[str]


class PropertyParentPartnerDocument(BaseModel):
    property_id: UUID
    partner_id: UUID
    parent_partner_document_id: UUID
    request_status: REQUEST_STATUS
    document_type: DOCUMENT_TYPE
    point_value: int
    # REQUESTOR DATA
    requestor_id: UUID
    requestor_name: str
    requestor_email: str
    # APPROVER DATA
    approved_by: Optional[UUID]
    approved_by_name: Optional[str]
    approved_by_email: Optional[str]
    rejection_reason: Optional[str]
