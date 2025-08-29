package user

import "github.com/google/uuid"

var (
	email1 string = "user@test.com"
	email2 string = "admin@test.com"
)

var dummyInMemoryUsers map[string]*User = map[string]*User{
	email1: {
		ID:       uuid.MustParse("a804a417-b1a0-4ec3-af0f-c273cc833fb4"),
		Email:    "user@test.com",
		Password: "$2a$14$oc4uCqQLF2uLBMBB617G6u.hE3qLZpa7nNc.CZsf0D80oXe8SN/sS",
	},
	email2: {
		ID:       uuid.MustParse("01a1b6cf-d3c6-429c-b194-4c03162a2332"),
		Email:    "admin@test.com",
		Password: "$2a$14$oc4uCqQLF2uLBMBB617G6u.hE3qLZpa7nNc.CZsf0D80oXe8SN/sS",
	},
}
