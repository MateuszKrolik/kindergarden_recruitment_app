package property

import (
	"context"

	"github.com/google/uuid"
)

type IPropertyService interface {
	GetPropertyByID(c context.Context, id uuid.UUID) (*Property, error)
}

type propertyService struct {
	repo IPropertyRepository
}

func NewPropertyService(repository IPropertyRepository) IPropertyService {
	return &propertyService{repo: repository}
}

func (s *propertyService) GetPropertyByID(c context.Context, id uuid.UUID) (*Property, error) {
	property, err := s.repo.GetByID(c, id)
	if err != nil {
		return nil, err
	}
	return property, nil
}
