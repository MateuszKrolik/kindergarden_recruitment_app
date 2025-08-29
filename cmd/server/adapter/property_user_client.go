package adapter

import (
	"context"

	"github.com/google/uuid"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/property"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/user"
)

type propertyUserClientAdapter struct {
	userService user.IUserService
}

func NewPropertyUserClientAdapter(userService user.IUserService) *propertyUserClientAdapter {
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
