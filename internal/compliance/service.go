package compliance

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var ErrorUserNeedsToBeAdmin error = errors.New(
	"User has to be an admin to approve document requests!",
)
var ErrorRequestAlreadyInDesiredStatus error = errors.New("Request already in desired status!")

type IComplianceService interface {
	SavePropertyParentDocApprovalRequest(c context.Context, doc *PropertyParentDocument) error
	EditPropertyParentDocApprovalRequestStatus(
		c context.Context,
		propertyID,
		adminID,
		docID uuid.UUID,
		status RequestStatus,
	) error
	GetAllParentDocRequestsForGivenProperty(
		c context.Context,
		propertyID uuid.UUID,
	) (*[]PropertyParentDocument, error)
}

type complianceService struct {
	repo           IComplianceRepository
	propertyClient IPropertyClient
}

func NewComplianceService(
	repo IComplianceRepository,
	propertyClient IPropertyClient,
) IComplianceService {
	return &complianceService{
		repo:           repo,
		propertyClient: propertyClient,
	}
}

func (s *complianceService) SavePropertyParentDocApprovalRequest(
	c context.Context,
	doc *PropertyParentDocument,
) error {
	if err := s.repo.SavePropertyParentDocApprovalRequest(c, doc); err != nil {
		return err
	}
	return nil
}

func (s *complianceService) EditPropertyParentDocApprovalRequestStatus(
	c context.Context,
	propertyID,
	adminID,
	docID uuid.UUID,
	status RequestStatus,
) error {
	// Validate admin role
	roleStr, err := s.propertyClient.GetPropertyUserRole(c, propertyID, adminID)
	if err != nil {
		return err
	}
	if UserRole(*roleStr) != Admin {
		return ErrorUserNeedsToBeAdmin
	}
	// Validate already in desired status
	existingRequest, err := s.repo.GetPropertyParentDocApprovalRequest(c, propertyID, docID)
	if err != nil {
		return err
	}
	if existingRequest.Status == status {
		return ErrorRequestAlreadyInDesiredStatus
	}

	// TODO: Send ChildPointsAssigned event to bus

	return s.repo.EditPropertyParentDocApprovalRequestStatus(c, propertyID, adminID, docID, status)
}

func (s *complianceService) GetAllParentDocRequestsForGivenProperty(
	c context.Context,
	propertyID uuid.UUID,
) (*[]PropertyParentDocument, error) {
	// TODO: Restrict access to only ADMIN for security
	return s.repo.GetAllParentDocRequestsForGivenProperty(c, propertyID)
}
