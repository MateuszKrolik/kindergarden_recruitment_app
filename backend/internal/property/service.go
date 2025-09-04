package property

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"github.com/MateuszKrolik/kindergarden_recruitment_app/cmd/server/shared"
)

var ErrUserDoesntExist error = errors.New("User doesn't exist!")

type IPropertyService interface {
	GetPropertyByID(c context.Context, id uuid.UUID) (*Property, error)
	RegisterUserToProperty(
		c context.Context,
		propertyId, userId uuid.UUID,
		userRole UserRole,
	) (*PropertyUser, error)
	GetDocumentRequirementsForGivenPropertyParent(
		c context.Context,
		propertyID, userID uuid.UUID,
	) (*[]PropertyParentDocumentRequirement, error)
	GetPropertyUserRole(
		c context.Context,
		propertyID,
		userID uuid.UUID,
	) (*string, error)
	GetPropertyChildrenByParentID(
		c context.Context,
		propertyID,
		parentID uuid.UUID,
	) (*[]PropertyChild, error)
	IncrementPropertyChildPoints(
		c context.Context,
		propertyID,
		childID uuid.UUID,
		pointValue int,
	) error
	GetPropertyParentDocRequirementPointValueByDocType(
		c context.Context,
		propertyID uuid.UUID,
		docType string,
	) (*int, error)
	GetPropertyChildByID(
		c context.Context,
		propertyID,
		childID uuid.UUID,
	) (*PropertyChild, error)
	GetAllProperties(
		c context.Context,
		pageNumber,
		pageSize int64,
	) (shared.PagedResponse[Property], error)
	GetPropertyUser(
		c context.Context,
		propertyID,
		userID uuid.UUID,
	) (*PropertyUser, error)
}

type propertyService struct {
	repo       IPropertyRepository
	userClient IUserClient
	docClient  IDocumentClient
}

func NewPropertyService(
	repository IPropertyRepository,
	userClient IUserClient,
	docClient IDocumentClient,
) IPropertyService {
	return &propertyService{
		repo:       repository,
		userClient: userClient,
		docClient:  docClient,
	}
}

func (s *propertyService) GetPropertyByID(c context.Context, id uuid.UUID) (*Property, error) {
	property, err := s.repo.GetByID(c, id)
	if err != nil {
		return nil, err
	}
	return property, nil
}

func (s *propertyService) RegisterUserToProperty(
	c context.Context,
	propertyId, userId uuid.UUID,
	userRole UserRole,
) (*PropertyUser, error) {
	exists, err := s.userClient.Exists(c, userId)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrUserDoesntExist
	}
	propertyUser, err := s.repo.RegisterUserToProperty(c, propertyId, userId, userRole)
	if err != nil {
		return nil, err
	}

	return propertyUser, nil
}

func (s *propertyService) GetDocumentRequirementsForGivenPropertyParent(
	c context.Context,
	propertyID, userID uuid.UUID,
) (*[]PropertyParentDocumentRequirement, error) {
	allRequirements, err := s.repo.GetPropertyParentDocumentRequirements(c, propertyID)
	if err != nil {
		return nil, err
	}
	conditionKeys, err := s.userClient.GetParentConditionKeys(c, userID)
	if err != nil {
		return nil, err
	}

	activeRequirements := []PropertyParentDocumentRequirement{}
	for _, r := range *allRequirements {
		if isParentRequirementActive(*conditionKeys, r) {
			activeRequirements = append(activeRequirements, r)
		}
	}

	return &activeRequirements, nil
}

func (s *propertyService) GetPropertyUserRole(
	c context.Context,
	propertyID,
	userID uuid.UUID,
) (*string, error) {
	return s.repo.GetPropertyUserRole(c, propertyID, userID)
}

func (s *propertyService) GetPropertyChildrenByParentID(
	c context.Context,
	propertyID,
	parentID uuid.UUID,
) (*[]PropertyChild, error) {
	// TODO: SQL JOIN IN THE FUTURE
	// 1. Get all children registered to property
	// 2. Get all children for given parent from identity client
	// 3. Filter out only relevant PropertyChildren and return
	allPropertyChildren, err := s.repo.GetAllChildrenForGivenProperty(c, propertyID)
	if err != nil {
		return nil, err
	}
	parentChildren, err := s.userClient.GetAllChildrenForGivenParent(c, parentID)
	if err != nil {
		return nil, err
	}

	if allPropertyChildren == nil || parentChildren == nil {
		return &[]PropertyChild{}, nil
	}

	if len(*allPropertyChildren) == 0 || len(*parentChildren) == 0 {
		return &[]PropertyChild{}, nil
	}

	result := []PropertyChild{}
	parentChildrenIDs := make(map[uuid.UUID]bool, len(*parentChildren))
	for _, parentChild := range *parentChildren {
		parentChildrenIDs[parentChild.ChildID] = true
	}

	for _, propChild := range *allPropertyChildren {
		if parentChildrenIDs[propChild.ChildID] {
			result = append(result, propChild)
		}
	}

	return &result, nil
}

func (s *propertyService) IncrementPropertyChildPoints(
	c context.Context,
	propertyID,
	childID uuid.UUID,
	pointValue int,
) error {
	return s.repo.IncrementPropertyChildPoints(c, propertyID, childID, pointValue)
}

func (s *propertyService) GetPropertyParentDocRequirementPointValueByDocType(
	c context.Context,
	propertyID uuid.UUID,
	docType string,
) (*int, error) {
	return s.repo.GetPropertyParentDocRequirementPointValueByDocType(c, propertyID, docType)
}

func (s *propertyService) GetPropertyChildByID(
	c context.Context,
	propertyID,
	childID uuid.UUID,
) (*PropertyChild, error) {
	// TODO: Check if child belongs to user/user is admin and throw 403 if not
	return s.repo.GetPropertyChildByID(c, propertyID, childID)
}

func (s *propertyService) GetAllProperties(
	c context.Context,
	pageNumber,
	pageSize int64,
) (shared.PagedResponse[Property], error) {
	return s.repo.GetAllProperties(c, pageNumber, pageSize)
}

func (s *propertyService) GetPropertyUser(
	c context.Context,
	propertyID,
	userID uuid.UUID,
) (*PropertyUser, error) {
	return s.repo.GetPropertyUser(c, propertyID, userID)
}

func isParentRequirementActive(
	cK ParentConditionKeys,
	r PropertyParentDocumentRequirement,
) bool {
	if r.RequirementType == Always {
		return true
	}

	if r.RequirementType == Conditional {
		switch r.ConditionKey {
		case IsEmployed:
			if cK.IsEmployed == nil {
				return false
			}
			return *cK.IsEmployed
		case IsSelfEmployed:
			if cK.IsSelfEmployed == nil {
				return false
			}
			return *cK.IsSelfEmployed
		case IsStudent:
			if cK.IsStudent == nil {
				return false
			}
			return *cK.IsStudent
		case FiledTaxInDesiredLocation:
			if cK.FiledTaxInDesiredLocation == nil {
				return false
			}
			return *cK.FiledTaxInDesiredLocation
		case ResidesInDesiredLocation:
			if cK.ResidesInDesiredLocation == nil {
				return false
			}
			return *cK.ResidesInDesiredLocation
		default:
			return false
		}
	}
	return false
}
