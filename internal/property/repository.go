package property

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var ErrorPropertyNotFound error = errors.New("Property not found!")

type IPropertyRepository interface {
	GetByID(c context.Context, id uuid.UUID) (*Property, error)
}

type inMemoryPropertyRepository struct {
	Properties map[uuid.UUID]*Property
}

func NewInMemoryPropertyRepository() IPropertyRepository {
	return &inMemoryPropertyRepository{Properties: dummyInMemoryProperties}
}

func (r *inMemoryPropertyRepository) GetByID(c context.Context, id uuid.UUID) (*Property, error) {
	property, exists := r.Properties[id]
	if !exists {
		return nil, ErrorPropertyNotFound
	}
	return property, nil
}
