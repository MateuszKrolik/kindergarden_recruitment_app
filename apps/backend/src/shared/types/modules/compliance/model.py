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
    approved_by: Optional[UUID]
    document_type: DOCUMENT_TYPE
    point_value: int


class PropertyChildDocument(BaseModel):
    property_id: UUID
    child_id: UUID
    child_document_id: UUID
    request_status: REQUEST_STATUS
    approved_by: Optional[UUID]
    document_type: CHILD_DOCUMENT_TYPE


class PropertyParentPartnerDocument(BaseModel):
    property_id: UUID
    partner_id: UUID
    parent_partner_document_id: UUID
    request_status: REQUEST_STATUS
    approved_by: Optional[UUID]
    document_type: DOCUMENT_TYPE
