package user

import (
	"context"

	"github.com/google/uuid"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/utils"
)

type IUserService interface {
	RegisterUser(c context.Context, email, password string) (*User, error)
	LoginUser(c context.Context, email, password string) (string, error)
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

func (s *userService) LoginUser(
	c context.Context,
	email, password string,
) (string, error) {
	user, err := s.repo.Login(c, email, password)
	if err != nil {
		return "", err
	}
	token, err := utils.GenerateToken(user.Email, user.ID)
	if err != nil {
		return "", err
	}
	return token, nil
}
