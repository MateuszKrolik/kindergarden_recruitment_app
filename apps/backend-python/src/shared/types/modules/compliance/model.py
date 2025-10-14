from typing import Optional
from uuid import UUID
from pydantic import BaseModel

from src.shared.types.modules.compliance.enum import REQUEST_STATUS


class PropertyParentDocument(BaseModel):
    property_id: UUID
    user_id: UUID
    parent_document_id: UUID
    request_status: REQUEST_STATUS
    approved_by: Optional[UUID]
