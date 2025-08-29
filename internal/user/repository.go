package user

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var (
	ErrorUserAlreadyExists error = errors.New("User with this email already exists!")
	ErrorUserNotFound      error = errors.New("User with this email not found!")
)

type IUserRepository interface {
	Save(c context.Context, user *User) error
	Login(c context.Context, email, password string) (*User, error)
	Exists(c context.Context, userID uuid.UUID) (bool, error)
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

func (r *inMemoryUserRepository) Login(c context.Context, email, password string) (*User, error) {
	user, exists := r.Users[email]
	if !exists {
		return nil, ErrorUserNotFound
	}
	if err := ComparePasswords(password, user.Password); err != nil {
		return nil, err
	}
	return user, nil
}

func (r *inMemoryUserRepository) Exists(c context.Context, userID uuid.UUID) (bool, error) {
	found := false
	for _, u := range r.Users {
		if u.ID == userID {
			found = true
		}
	}
	return found, nil
}
