package compliance

import "github.com/google/uuid"

var parentDocumentID uuid.UUID = uuid.MustParse("eb04c874-71f9-43f4-a0c9-ecb52ec63dbe")

var propertyID uuid.UUID = uuid.MustParse("7f472b5d-aead-437f-a7b6-32169c09e79b")

var inMemoryPropertyParentDocumentApprovalRequests map[uuid.UUID]*PropertyParentDocument = map[uuid.UUID]*PropertyParentDocument{
	parentDocumentID: {
		ParentDocumentID: parentDocumentID,
		PropertyID:       propertyID,
		Status:           PendingStatus,
		ApprovedBy:       nil,
	},
}
