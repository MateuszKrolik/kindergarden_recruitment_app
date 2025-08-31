package property

import (
	"context"

	"github.com/google/uuid"
)

type ParentConditionKeys struct {
	IsEmployed                *bool `json:"is_employed"`
	IsSelfEmployed            *bool `json:"is_self_employed"`
	IsStudent                 *bool `json:"is_student"`
	FiledTaxInDesiredLocation *bool `json:"filed_tax_in_desired_location"`
	ResidesInDesiredLocation  *bool `json:"resides_in_desired_location"`
}

type ParentUserChild struct {
	UserID  uuid.UUID `json:"user_id"`
	ChildID uuid.UUID `json:"child_id"`
}

type IUserClient interface {
	Exists(c context.Context, userID uuid.UUID) (bool, error)
	GetParentConditionKeys(c context.Context, userID uuid.UUID) (*ParentConditionKeys, error)
	GetAllChildrenForGivenParent(c context.Context, userID uuid.UUID) (*[]ParentUserChild, error)
}

type IDocumentClient interface {
	GetParentDocumentTypeByID(c context.Context, documentID uuid.UUID) (*string, error) // TODO
}
