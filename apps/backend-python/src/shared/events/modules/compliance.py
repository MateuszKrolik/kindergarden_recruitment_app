from enum import StrEnum


class COMPLIANCE_EVENT(StrEnum):
    PROPERTY_PARENT_DOCUMENT_APPROVED = "property.parent.document.approved"
    PROPERTY_PARENT_DOCUMENT_REJECTED = "property.parent.document.rejected"
    PROPERTY_PARENT_DOCUMENT_REQUESTED = "property.parent.document.requested"
