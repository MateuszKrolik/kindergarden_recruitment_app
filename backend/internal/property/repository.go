package property

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var (
	ErrorPropertyNotFound                          error = errors.New("Property not found!")
	ErrorPropertyUserNotFound                      error = errors.New("Property user not found!")
	ErrorPropertyChildNotFound                     error = errors.New("Property child not found!")
	ErrorPropertyParentDocumentRequirementNotFound error = errors.New(
		"Property parent doc requirement not found!",
	)
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
	GetPropertyUser(
		c context.Context,
		propertyID,
		userID uuid.UUID,
	) (*PropertyUser, error)
	GetPropertyUserRole(
		c context.Context,
		propertyID,
		userID uuid.UUID,
	) (*string, error)
	GetAllChildrenForGivenProperty(
		c context.Context,
		propertyID uuid.UUID,
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
}

type inMemoryPropertyRepository struct {
	Properties                         map[uuid.UUID]*Property
	PropertyUsers                      map[uuid.UUID]*PropertyUser
	PropertyParentDocumentRequirements []PropertyParentDocumentRequirement
	PropertyChildren                   map[uuid.UUID]*PropertyChild
}

func NewInMemoryPropertyRepository() IPropertyRepository {
	return &inMemoryPropertyRepository{
		Properties:                         dummyInMemoryProperties,
		PropertyUsers:                      dummyInMemoryPropertyUsers,
		PropertyParentDocumentRequirements: inMemoryPropertyParentDocumentRequirements,
		PropertyChildren:                   inMemoryPropertyChildren,
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

func (r *inMemoryPropertyRepository) GetPropertyUser(
	c context.Context,
	propertyID,
	userID uuid.UUID,
) (*PropertyUser, error) {
	for _, pu := range r.PropertyUsers {
		if pu != nil && pu.PropertyID == propertyID && pu.UserID == userID {
			return pu, nil
		}
	}

	return nil, ErrorPropertyUserNotFound
}

func (r *inMemoryPropertyRepository) GetPropertyUserRole(
	c context.Context,
	propertyID,
	userID uuid.UUID,
) (*string, error) {
	pU, err := r.GetPropertyUser(c, propertyID, userID)
	if err != nil {
		return nil, err
	}
	roleStr := string((*pU).Role)
	return &roleStr, nil
}

func (r *inMemoryPropertyRepository) GetAllChildrenForGivenProperty(
	c context.Context,
	propertyID uuid.UUID,
) (*[]PropertyChild, error) {
	result := []PropertyChild{}
	for _, pc := range r.PropertyChildren {
		if pc != nil && pc.PropertyID == propertyID {
			result = append(result, *pc)
		}
	}

	return &result, nil
}

func (r *inMemoryPropertyRepository) IncrementPropertyChildPoints(
	c context.Context,
	propertyID,
	childID uuid.UUID,
	pointValue int,
) error {
	child, exists := r.PropertyChildren[childID]
	if !exists {
		return ErrorPropertyChildNotFound
	}
	child.Points += pointValue
	r.PropertyChildren[childID] = child
	return nil
}

func (r *inMemoryPropertyRepository) GetPropertyParentDocRequirementPointValueByDocType(
	c context.Context,
	propertyID uuid.UUID,
	docType string,
) (*int, error) {
	for _, ppdr := range r.PropertyParentDocumentRequirements {
		if ppdr.PropertyID == propertyID && string(ppdr.DocumentType) == docType {
			return &ppdr.PointValue, nil
		}
	}

	return nil, ErrorPropertyParentDocumentRequirementNotFound
}

func (r *inMemoryPropertyRepository) GetPropertyChildByID(
	c context.Context,
	propertyID,
	childID uuid.UUID,
) (*PropertyChild, error) {
	for _, pc := range r.PropertyChildren {
		if pc != nil && pc.PropertyID == propertyID && pc.ChildID == childID {
			return pc, nil
		}
	}

	return nil, ErrorPropertyChildNotFound
}
