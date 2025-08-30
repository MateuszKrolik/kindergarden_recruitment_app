package user

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var (
	ErrorUserAlreadyExists             error = errors.New("User with this email already exists!")
	ErrorUserNotFound                  error = errors.New("User with this email not found!")
	ErrorParentUserDetailsAlreadyExist error = errors.New("Parent user details already exist!")
	ErrorParentUserDetailsDontExist    error = errors.New("Parent user details don't exist!")
)

type IUserRepository interface {
	Save(c context.Context, user *User) error
	Login(c context.Context, email, password string) (*User, error)
	Exists(c context.Context, userID uuid.UUID) (bool, error)
	DoParentUserDetailsExist(c context.Context, userID uuid.UUID) (bool, error)
	SaveParentUserDetails(c context.Context, pU ParentUserDetails) error
	GetParentConditionKeys(c context.Context, userID uuid.UUID) (*ParentConditionKeys, error)
}

type inMemoryUserRepository struct {
	Users             map[string]*User
	ParentUserDetails map[uuid.UUID]*ParentUserDetails
}

func NewInMemoryUserRepository() IUserRepository {
	return &inMemoryUserRepository{
		Users:             dummyInMemoryUsers,
		ParentUserDetails: dummyInMemoryParentUserDetails,
	}
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

func (r *inMemoryUserRepository) SaveParentUserDetails(
	c context.Context,
	pU ParentUserDetails,
) error {
	uID := pU.UserID
	exists, err := r.Exists(c, uID)
	if err != nil {
		return err
	}
	if !exists {
		return ErrorUserNotFound
	}
	exist, err := r.DoParentUserDetailsExist(c, uID)
	if err != nil {
		return err
	}
	if exist {
		return ErrorParentUserDetailsAlreadyExist
	}
	r.ParentUserDetails[uID] = &pU
	return nil
}

func (r *inMemoryUserRepository) DoParentUserDetailsExist(
	c context.Context,
	userID uuid.UUID,
) (bool, error) {
	_, exist := r.ParentUserDetails[userID]
	if exist {
		return true, nil
	}
	return false, nil
}

func (r *inMemoryUserRepository) GetParentConditionKeys(
	c context.Context,
	userID uuid.UUID,
) (*ParentConditionKeys, error) {
	details, exists := r.ParentUserDetails[userID]
	if !exists {
		return nil, ErrorParentUserDetailsDontExist
	}

	return &ParentConditionKeys{
		IsEmployed:                details.IsEmployed,
		IsSelfEmployed:            details.IsEmployed,
		IsStudent:                 details.IsStudent,
		FiledTaxInDesiredLocation: details.FiledTaxInDesiredLocation,
		ResidesInDesiredLocation:  details.ResidesInDesiredLocation,
	}, nil
}
