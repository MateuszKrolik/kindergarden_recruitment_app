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
	childID     uuid.UUID = uuid.MustParse("446b8aa1-a001-4204-8d71-c1103756537b")
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
		// Condition Keys
		IsEmployed:                boolPtr(true),
		IsSelfEmployed:            boolPtr(true),
		IsStudent:                 boolPtr(false),
		FiledTaxInDesiredLocation: boolPtr(true),
		ResidesInDesiredLocation:  boolPtr(true),
	},
}

var inMemoryChildren map[uuid.UUID]*Child = map[uuid.UUID]*Child{
	childID: {
		ID:     childID,
		Points: 0,
		// Condition Keys
		HasDisability: boolPtr(true),
		// TODO
	},
}

var inMemoryParentUserChildren map[uuid.UUID]*ParentUserChild = map[uuid.UUID]*ParentUserChild{
	childID: {
		ChildID: childID,
		UserID:  parentID,
	},
}

func boolPtr(b bool) *bool {
	return &b
}
