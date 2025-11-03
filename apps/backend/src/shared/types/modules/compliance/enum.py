from enum import StrEnum


class REQUEST_STATUS(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class COMPLIANCE_EVENT(StrEnum):
    # PARENT
    PROPERTY_PARENT_DOCUMENT_REQUESTED = "property.parent.document.requested"
    PROPERTY_PARENT_DOCUMENT_APPROVED = "property.parent.document.approved"
    PROPERTY_PARENT_DOCUMENT_REJECTED = "property.parent.document.rejected"
    PROPERTY_PARENT_DOCUMENT_UPDATED = "property.parent.document.updated"
    # CHILD
    PROPERTY_CHILD_DOCUMENT_REQUESTED = "property.child.document.requested"
    PROPERTY_CHILD_DOCUMENT_APPROVED = "property.child.document.approved"
    PROPERTY_CHILD_DOCUMENT_REJECTED = "property.child.document.rejected"
    PROPERTY_CHILD_DOCUMENT_UPDATED = "property.child.document.updated"
    # PARTNER
    PROPERTY_PARENT_PARTNER_DOCUMENT_REQUESTED = (
        "property.parent.partner.document.requested"
    )
    PROPERTY_PARENT_PARTNER_DOCUMENT_APPROVED = (
        "property.parent.partner.document.approved"
    )
    PROPERTY_PARENT_PARTNER_DOCUMENT_REJECTED = (
        "property.parent.partner.document.rejected"
    )
    PROPERTY_PARENT_PARTNER_DOCUMENT_UPDATED = (
        "property.parent.partner.document.updated"
    )
