from uuid import UUID
from pydantic import BaseModel

from src.shared.types.modules.identity.enum import PROPERTY_USER_ROLE


class ParentConditionKeys(BaseModel):
    is_employed: bool
    is_self_employed: bool
    is_student: bool
    filed_tax_in_desired_location: bool
    resides_in_desired_location: bool


class PropertyUser(BaseModel):
    property_id: UUID
    user_id: UUID
    role: PROPERTY_USER_ROLE


class ParentChild(BaseModel):
    parent_id: UUID
    child_id: UUID


class ChildConditionKeys(BaseModel):
    has_disability: bool
