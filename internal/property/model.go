package property

import "github.com/google/uuid"

type Property struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type PropertyUser struct {
	PropertyID uuid.UUID `json:"property_id"`
	UserID     uuid.UUID `json:"user_id"`
	Role       UserRole  `json:"role"`
}
