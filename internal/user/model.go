package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID       uuid.UUID `json:"id"`
	Email    string    `json:"email"`
	Password string    `json:"password"`
}

type ParentUserDetails struct {
	UserID      uuid.UUID `json:"user_id"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	Phone       string    `json:"phone"`
	PESEL       string    `json:"pesel"`
	BirthDate   time.Time `json:"birth_date"`
	HomeAddress string    `json:"home_address"`
	Workplace   string    `json:"workplace"`
	Gender      Gender    `json:"gender"`
	// Requirement flags
	IsEmployed                *bool `json:"is_employed"`
	IsSelfEmployed            *bool `json:"is_self_employed"`
	IsStudent                 *bool `json:"is_student"`
	FiledTaxInDesiredLocation *bool `json:"filed_tax_in_desired_location"`
	ResidesInDesiredLocation  *bool `json:"resides_in_desired_location"`
}
