package compliance

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/bus"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/shared"
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
	bus            bus.IEventBus
}

func NewComplianceService(
	repo IComplianceRepository,
	propertyClient IPropertyClient,
	bus bus.IEventBus,
) IComplianceService {
	return &complianceService{
		repo:           repo,
		propertyClient: propertyClient,
		bus:            bus,
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
	roleStrPtr, err := s.propertyClient.GetPropertyUserRole(c, propertyID, adminID)
	if err != nil {
		return err
	}
	if UserRole(*roleStrPtr) != Admin {
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

	if err := s.repo.EditPropertyParentDocApprovalRequestStatus(c, propertyID, adminID, docID, status); err != nil {
		return err
	}

	eventData := shared.PropertyParentDocumentStatusUpdated{
		PropertyID:       propertyID,
		ParentID:         existingRequest.ParentID,
		ParentDocumentID: docID,
		Status:           shared.RequestStatus(status),
		ApprovedBy:       adminID,
		Timestamp:        time.Now(),
	}

	s.bus.Publish(bus.Event{
		ID:   uuid.New().String(),
		Name: shared.PropertyParentDocumentStatusUpdatedEventName,
		Data: eventData,
	})

	return nil
}

func (s *complianceService) GetAllParentDocRequestsForGivenProperty(
	c context.Context,
	propertyID uuid.UUID,
) (*[]PropertyParentDocument, error) {
	// TODO: Restrict access to only ADMIN for security
	return s.repo.GetAllParentDocRequestsForGivenProperty(c, propertyID)
}
