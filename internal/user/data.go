package user

import (
	"time"

	"github.com/google/uuid"
)

var (
	parentEmail string    = "parent@test.com"
	adminEmail  string    = "admin@test.com"
	password    string    = "$2a$14$oc4uCqQLF2uLBMBB617G6u.hE3qLZpa7nNc.CZsf0D80oXe8SN/sS"
	parentID    uuid.UUID = uuid.MustParse("a804a417-b1a0-4ec3-af0f-c273cc833fb4")
)

var dummyInMemoryUsers map[string]*User = map[string]*User{
	parentEmail: {
		ID:       parentID,
		Email:    parentEmail,
		Password: password,
	},
	adminEmail: {
		ID:       uuid.MustParse("01a1b6cf-d3c6-429c-b194-4c03162a2332"),
		Email:    adminEmail,
		Password: password,
	},
}

var dummyInMemoryParentUserDetails map[uuid.UUID]*ParentUserDetails = map[uuid.UUID]*ParentUserDetails{
	parentID: {
		UserID:      parentID,
		FirstName:   "John",
		LastName:    "Doe",
		Phone:       "+48111111111",
		PESEL:       "dummy",
		BirthDate:   time.Now(),
		HomeAddress: "dummy",
		Workplace:   "dummy",
		Gender:      Male,
		// Requirement flags
		IsEmployed:                boolPtr(true),
		IsSelfEmployed:            boolPtr(true),
		IsStudent:                 boolPtr(false),
		FiledTaxInDesiredLocation: boolPtr(true),
		ResidesInDesiredLocation:  boolPtr(true),
	},
}

func boolPtr(b bool) *bool {
	return &b
}
