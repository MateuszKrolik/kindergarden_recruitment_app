package user

import (
	"context"

	"github.com/google/uuid"
)

type IUserService interface {
	RegisterUser(c context.Context, email, password string) (*User, error)
	LoginUser(c context.Context, email, password string) (string, error)
	Exists(c context.Context, userID uuid.UUID) (bool, error)
	SaveParentUserDetails(c context.Context, pU ParentUserDetails) error
}

type userService struct {
	repo IUserRepository
}

func NewUserService(repository IUserRepository) IUserService {
	return &userService{repo: repository}
}

func (s *userService) RegisterUser(c context.Context, email, password string) (*User, error) {
	hashedPassword, err := HashPassword(password)
	if err != nil {
		return nil, err
	}
	user := &User{ID: uuid.New(), Email: email, Password: hashedPassword}
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
	token, err := GenerateToken(user.Email, user.ID)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *userService) Exists(c context.Context, userID uuid.UUID) (bool, error) {
	return s.repo.Exists(c, userID)
}

func (s *userService) SaveParentUserDetails(
	c context.Context,
	pU ParentUserDetails,
) error {
	// TODO: Business logic validation
	return s.repo.SaveParentUserDetails(c, pU)
}
