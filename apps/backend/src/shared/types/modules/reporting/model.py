from uuid import UUID
from pydantic import BaseModel

from src.shared.types.modules.reporting.enum import DOCUMENT_TYPE


class ParentDocument(BaseModel):
    id: UUID
    user_id: UUID
    document_type: DOCUMENT_TYPE
    file_path: str
