package compliance

import "github.com/google/uuid"

type PropertyParentDocument struct {
	PropertyID       uuid.UUID     `json:"property_id"`
	ParentID         uuid.UUID     `json:"parent_id"`
	ParentDocumentID uuid.UUID     `json:"user_document_id"`
	Status           RequestStatus `json:"status"`
	ApprovedBy       *uuid.UUID    `json:"approved_by,omitempty"`
}
