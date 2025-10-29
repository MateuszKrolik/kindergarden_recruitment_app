from enum import StrEnum


class COMPLIANCE_EVENT(StrEnum):
    PROPERTY_PARENT_DOCUMENT_APPROVED = "property.parent.document.approved"
    PROPERTY_PARENT_DOCUMENT_REQUESTED = "property.parent.document.requested"
    PROPERTY_CHILD_DOCUMENT_APPROVED = "property.child.document.approved"
    PROPERTY_CHILD_DOCUMENT_REQUESTED = "property.child.document.requested"
    PROPERTY_PARENT_PARTNER_DOCUMENT_REQUESTED = (
        "property.parent.partner.document.requested"
    )
    PROPERTY_PARENT_PARTNER_DOCUMENT_APPROVED = (
        "property.parent.partner.document.approved"
    )
