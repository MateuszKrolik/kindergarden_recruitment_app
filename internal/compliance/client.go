package compliance

import (
	"context"

	"github.com/google/uuid"
)

type IPropertyClient interface {
	GetPropertyUserRole(
		c context.Context,
		propertyID,
		userID uuid.UUID,
	) (*string, error)
}
