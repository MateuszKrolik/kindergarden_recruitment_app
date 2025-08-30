package compliance

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var ErrorRequestAlreadyExists error = errors.New("Request already exists!")

type IComplianceRepository interface {
	SavePropertyParentDocApprovalRequest(c context.Context, doc *PropertyParentDocument) error
}

type inMemoryComplianceRepository struct {
	PropertyParentDocuments map[uuid.UUID]*PropertyParentDocument
}

func NewInMemoryComplianceRepository() IComplianceRepository {
	return &inMemoryComplianceRepository{
		PropertyParentDocuments: inMemoryPropertyParentDocumentApprovalRequests,
	}
}

func (r *inMemoryComplianceRepository) SavePropertyParentDocApprovalRequest(
	c context.Context,
	doc *PropertyParentDocument,
) error {
	docID := doc.ParentDocumentID
	_, exists := r.PropertyParentDocuments[docID]
	if exists {
		return ErrorRequestAlreadyExists
	}

	r.PropertyParentDocuments[docID] = doc
	return nil
}
