package compliance

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var (
	ErrorRequestAlreadyExists error = errors.New("Request already exists!")
	ErrorRequestDoesntExist   error = errors.New("Request doesn't exists!")
)

type IComplianceRepository interface {
	SavePropertyParentDocApprovalRequest(c context.Context, doc *PropertyParentDocument) error
	EditPropertyParentDocApprovalRequestStatus(
		c context.Context,
		propertyID,
		adminID,
		docID uuid.UUID,
		status RequestStatus,
	) error
	GetPropertyParentDocApprovalRequest(
		c context.Context,
		propertyID,
		docID uuid.UUID,
	) (*PropertyParentDocument, error)
	GetAllParentDocRequestsForGivenProperty(
		c context.Context,
		propertyID uuid.UUID,
	) (*[]PropertyParentDocument, error)
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

func (r *inMemoryComplianceRepository) EditPropertyParentDocApprovalRequestStatus(
	c context.Context,
	propertyID,
	adminID,
	docID uuid.UUID,
	status RequestStatus,
) error {
	request, err := r.GetPropertyParentDocApprovalRequest(c, propertyID, docID)
	if err != nil {
		return err
	}
	request.ApprovedBy = &adminID
	request.Status = status
	r.PropertyParentDocuments[docID] = request
	return nil
}

func (r *inMemoryComplianceRepository) GetPropertyParentDocApprovalRequest(
	c context.Context,
	propertyID,
	docID uuid.UUID,
) (*PropertyParentDocument, error) {
	for _, ppd := range r.PropertyParentDocuments {
		if ppd != nil && ppd.PropertyID == propertyID && ppd.ParentDocumentID == docID {
			return ppd, nil
		}
	}

	return nil, ErrorRequestDoesntExist
}

func (r *inMemoryComplianceRepository) GetAllParentDocRequestsForGivenProperty(
	c context.Context,
	propertyID uuid.UUID,
) (*[]PropertyParentDocument, error) {
	result := []PropertyParentDocument{}
	for _, ppd := range r.PropertyParentDocuments {
		if ppd.PropertyID == propertyID {
			result = append(result, *ppd)
		}
	}
	return &result, nil
}
