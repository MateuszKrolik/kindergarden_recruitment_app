package user

import (
	"context"
	"errors"
)

var ErrorUserAlreadyExists error = errors.New("User with this email already exists!")

type IUserRepository interface {
	Save(c context.Context, user *User) error
}

type inMemoryUserRepository struct {
	Users map[string]*User
}

func NewInMemoryUserRepository() IUserRepository {
	return &inMemoryUserRepository{Users: dummyInMemoryUsers}
}

func (r *inMemoryUserRepository) Save(c context.Context, user *User) error {
	_, exists := r.Users[user.Email]
	if exists {
		return ErrorUserAlreadyExists
	}
	r.Users[user.Email] = user
	return nil
}
