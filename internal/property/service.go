package property

import (
	"context"
	"errors"

	"github.com/google/uuid"
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
}

type propertyService struct {
	repo       IPropertyRepository
	userClient IUserClient
}

func NewPropertyService(repository IPropertyRepository, userClient IUserClient) IPropertyService {
	return &propertyService{repo: repository, userClient: userClient}
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
