package user

import (
	"context"

	"github.com/google/uuid"
)

type IUserService interface {
	RegisterUser(c context.Context, email, password string) (*User, error)
}

type userService struct {
	repo IUserRepository
}

func NewUserService(repository IUserRepository) IUserService {
	return &userService{repo: repository}
}

func (s *userService) RegisterUser(c context.Context, email, password string) (*User, error) {
	// TODO: pwd hashing
	user := &User{ID: uuid.New(), Email: email, Password: password}
	if err := s.repo.Save(c, user); err != nil {
		return nil, err
	}
	return user, nil
}
