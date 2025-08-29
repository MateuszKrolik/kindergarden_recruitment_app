package property

import (
	"context"

	"github.com/google/uuid"
)

type IUserClient interface {
	Exists(c context.Context, userID uuid.UUID) (bool, error)
}
