package property

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var ErrorPropertyNotFound error = errors.New("Property not found!")

type IPropertyRepository interface {
	GetByID(c context.Context, id uuid.UUID) (*Property, error)
	RegisterUserToProperty(
		c context.Context,
		propertyId, userId uuid.UUID,
		userRole UserRole,
	) (*PropertyUser, error)
}

type inMemoryPropertyRepository struct {
	Properties    map[uuid.UUID]*Property
	PropertyUsers map[uuid.UUID]*PropertyUser
}

func NewInMemoryPropertyRepository() IPropertyRepository {
	return &inMemoryPropertyRepository{
		Properties:    dummyInMemoryProperties,
		PropertyUsers: dummyInMemoryPropertyUsers,
	}
}

func (r *inMemoryPropertyRepository) GetByID(c context.Context, id uuid.UUID) (*Property, error) {
	property, exists := r.Properties[id]
	if !exists {
		return nil, ErrorPropertyNotFound
	}
	return property, nil
}

func (r *inMemoryPropertyRepository) RegisterUserToProperty(
	c context.Context,
	propertyId, userId uuid.UUID,
	userRole UserRole,
) (*PropertyUser, error) {
	_, exists := r.Properties[propertyId]
	if !exists {
		return nil, ErrorPropertyNotFound
	}

	propertyUser := &PropertyUser{PropertyID: propertyId, UserID: userId, Role: userRole}
	r.PropertyUsers[userId] = propertyUser

	return propertyUser, nil
}
