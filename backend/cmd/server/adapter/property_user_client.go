package adapter

import (
	"context"

	"github.com/google/uuid"

	"github.com/MateuszKrolik/kindergarden_recruitment_app/internal/identity"
	"github.com/MateuszKrolik/kindergarden_recruitment_app/internal/property"
)

type propertyUserClientAdapter struct {
	userService identity.IUserService
}

func NewPropertyUserClientAdapter(userService identity.IUserService) *propertyUserClientAdapter {
	return &propertyUserClientAdapter{userService: userService}
}

func (a *propertyUserClientAdapter) Exists(c context.Context, userID uuid.UUID) (bool, error) {
	return a.userService.Exists(c, userID)
}

func (a *propertyUserClientAdapter) GetParentConditionKeys(
	c context.Context,
	userID uuid.UUID,
) (*property.ParentConditionKeys, error) {
	userKeys, err := a.userService.GetParentConditionKeys(c, userID)
	if err != nil {
		return nil, err
	}

	return &property.ParentConditionKeys{
		IsEmployed:                userKeys.IsEmployed,
		IsSelfEmployed:            userKeys.IsSelfEmployed,
		IsStudent:                 userKeys.IsStudent,
		FiledTaxInDesiredLocation: userKeys.FiledTaxInDesiredLocation,
		ResidesInDesiredLocation:  userKeys.ResidesInDesiredLocation,
	}, nil
}

func (a *propertyUserClientAdapter) GetAllChildrenForGivenParent(
	c context.Context,
	userID uuid.UUID,
) (*[]property.ParentUserChild, error) {
	childrenPtr, err := a.userService.GetAllChildrenForGivenParent(c, userID)
	if err != nil {
		return nil, err
	}
	if childrenPtr == nil {
		return nil, nil
	}
	children := *childrenPtr
	result := make([]property.ParentUserChild, len(children))
	for i, child := range children {
		result[i] = property.ParentUserChild{
			UserID:  child.ChildID,
			ChildID: child.ChildID,
		}
	}
	return &result, nil
}
