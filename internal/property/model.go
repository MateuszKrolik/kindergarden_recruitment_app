package property

import "github.com/google/uuid"

type Property struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type UserRole string

var (
	Admin  UserRole = "admin"
	Parent UserRole = "parent"
)

func (r UserRole) IsValid() bool {
	switch r {
	case Admin, Parent:
		return true
	}
	return false
}

type PropertyUser struct {
	PropertyID uuid.UUID `json:"property_id"`
	UserID     uuid.UUID `json:"user_id"`
	Role       UserRole  `json:"role"`
}
