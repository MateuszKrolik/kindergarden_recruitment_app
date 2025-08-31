package shared

import (
	"time"

	"github.com/google/uuid"
)

type PropertyParentDocumentStatusUpdated struct {
	PropertyID       uuid.UUID     `json:"property_id"`
	ParentDocumentID uuid.UUID     `json:"parent_document_id"`
	ParentID         uuid.UUID     `json:"parent_id"`
	Status           RequestStatus `json:"status"`
	ApprovedBy       uuid.UUID     `json:"approved_by"`
	Timestamp        time.Time     `json:"timestamp"`
}

func (e PropertyParentDocumentStatusUpdated) Name() string {
	return "property_parent_document_status_updated"
}
