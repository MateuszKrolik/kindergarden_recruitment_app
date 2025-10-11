from pydantic import BaseModel
from uuid import UUID

from src.modules.property_management.enum import CONDITION_KEY, REQUIREMENT_TYPE
from src.shared.types.modules.reporting import DOCUMENT_TYPE


class Property(BaseModel):
    id: UUID
    name: str
    slug: str


class PropertyParentDocumentRequirement(BaseModel):
    property_id: UUID
    document_type: DOCUMENT_TYPE
    requirement_type: REQUIREMENT_TYPE
    condition_key: CONDITION_KEY
    point_value: int
