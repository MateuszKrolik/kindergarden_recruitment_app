package property

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

var (
	ErrorPropertyNotFound     error = errors.New("Property not found!")
	ErrorPropertyUserNotFound error = errors.New("Property user not found!")
)

type IPropertyRepository interface {
	GetByID(c context.Context, id uuid.UUID) (*Property, error)
	RegisterUserToProperty(
		c context.Context,
		propertyId, userId uuid.UUID,
		userRole UserRole,
	) (*PropertyUser, error)
	GetPropertyParentDocumentRequirements(
		c context.Context,
		propertyID uuid.UUID,
	) (*[]PropertyParentDocumentRequirement, error)
	GetPropertyUserRole(
		c context.Context,
		propertyID,
		userID uuid.UUID,
	) (*string, error)
}

type inMemoryPropertyRepository struct {
	Properties                         map[uuid.UUID]*Property
	PropertyUsers                      map[uuid.UUID]*PropertyUser
	PropertyParentDocumentRequirements []PropertyParentDocumentRequirement
}

func NewInMemoryPropertyRepository() IPropertyRepository {
	return &inMemoryPropertyRepository{
		Properties:                         dummyInMemoryProperties,
		PropertyUsers:                      dummyInMemoryPropertyUsers,
		PropertyParentDocumentRequirements: inMemoryPropertyParentDocumentRequirements,
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

func (r *inMemoryPropertyRepository) GetPropertyParentDocumentRequirements(
	c context.Context,
	propertyID uuid.UUID,
) (*[]PropertyParentDocumentRequirement, error) {
	return &r.PropertyParentDocumentRequirements, nil
}

func (r *inMemoryPropertyRepository) GetPropertyUserRole(
	c context.Context,
	propertyID,
	userID uuid.UUID,
) (*string, error) {
	for _, pu := range r.PropertyUsers {
		fmt.Printf("propID: %v", pu.PropertyID)
		fmt.Printf("userID: %v", pu.UserID)
		if pu != nil && pu.PropertyID == propertyID && pu.UserID == userID {
			role := string(pu.Role)
			return &role, nil
		}
	}

	return nil, ErrorPropertyUserNotFound
}
