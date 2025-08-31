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
	// Condition Keys
	IsEmployed                *bool `json:"is_employed"`
	IsSelfEmployed            *bool `json:"is_self_employed"`
	IsStudent                 *bool `json:"is_student"`
	FiledTaxInDesiredLocation *bool `json:"filed_tax_in_desired_location"`
	ResidesInDesiredLocation  *bool `json:"resides_in_desired_location"`
}

type Child struct {
	ID        uuid.UUID `json:"id"`
	FullName  string    `json:"full_name"`
	PESEL     string    `json:"pesel"`
	BirthDate time.Time `json:"birth_date"`
	Address   string    `json:"address"`
	Points    int       `json:"points"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	// Condition Keys
	RequiresEarlyDevelopmentSupport *bool `json:"requires_early_development_support"`
	HasDisability                   *bool `json:"has_disability"`
	NeedsSpecialEducation           *bool `json:"needs_special_education"`
	IsSingleParentFamily            *bool `json:"is_single_parent_family"`
	HasDisabledParent               *bool `json:"has_disabled_parent"`
	WasPreviouslyRejected           *bool `json:"was_previously_rejected"`
	LargeFamily                     *bool `json:"large_family"`
	Vaccinated                      *bool `json:"vaccinated"`
	VaccinationExemption            *bool `json:"vaccination_exemption"`
	HasSiblingInInstitution         *bool `json:"has_sibling_in_institution"`
	HasDisabledSibling              *bool `json:"has_disabled_sibling"`
	DifficultSituation              *bool `json:"difficult_situation"`
	// Optional fields
	DifficultSituationDescription *string `json:"difficult_situation_description"`
	Diet                          *string `json:"diet,omitempty"`
}

type ParentUserChild struct {
	UserID  uuid.UUID `json:"user_id"`
	ChildID uuid.UUID `json:"child_id"`
}
