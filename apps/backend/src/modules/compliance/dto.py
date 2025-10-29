from pydantic import BaseModel

from src.shared.types.modules.reporting.enum import CHILD_DOCUMENT_TYPE, DOCUMENT_TYPE


class PropertyParentDocumentRequest(BaseModel):
    document_type: DOCUMENT_TYPE
    point_value: int


class PropertyChildDocumentRequest(BaseModel):
    document_type: CHILD_DOCUMENT_TYPE
    point_value: int


class PropertyParentPartnerDocumentRequest(BaseModel):
    document_type: DOCUMENT_TYPE
    point_value: int
