from uuid import UUID
from pydantic import BaseModel

from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE


class ParentDocument(BaseModel):
    id: UUID
    user_id: UUID
    document_type: DOCUMENT_TYPE
    file_path: str


class ChildDocument(BaseModel):
    id: UUID
    child_id: UUID
    document_type: CHILD_DOCUMENT_TYPE
    file_path: str
