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
