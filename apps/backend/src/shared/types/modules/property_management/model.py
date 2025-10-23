from pydantic import BaseModel
from uuid import UUID

from src.shared.types.modules.property_management.enum import (
    CHILD_CONDITION_KEY,
    CONDITION_KEY,
    REQUIREMENT_TYPE,
)
from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE


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


class PropertyChild(BaseModel):
    property_id: UUID
    child_id: UUID
    points: int
    approved: bool


class PropertyChildDocumentRequirement(BaseModel):
    property_id: UUID
    document_type: CHILD_DOCUMENT_TYPE
    requirement_type: REQUIREMENT_TYPE
    condition_key: CHILD_CONDITION_KEY
    point_value: int
