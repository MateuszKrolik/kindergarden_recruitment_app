from src.shared.types.modules.compliance.model import (
    PropertyChildDocument,
    PropertyParentDocument,
    PropertyParentPartnerDocument,
)


class PropertyParentDocumentApproved(PropertyParentDocument):
    pass


class PropertyChildDocumentApproved(PropertyChildDocument):
    pass


class PropertyParentPartnerDocumentApproved(PropertyParentPartnerDocument):
    pass


class PropertyParentDocumentRejected(PropertyParentDocument):
    pass


class PropertyChildDocumentRejected(PropertyChildDocument):
    pass


class PropertyParentPartnerDocumentRejected(PropertyParentPartnerDocument):
    pass
