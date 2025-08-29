package user

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

var (
	secretKey                   string
	ErrorSecretKeyCannotBeEmpty error = errors.New("Secret key cannot be empty!")
)

func init() {
	godotenv.Load()
	secretKey = os.Getenv("SECRET_KEY")
}

func ComparePasswords(plainPw string, hashedPw string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPw), []byte(plainPw)); err != nil {
		return err
	}
	return nil
}

func HashPassword(plainPassword string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(plainPassword), 14)
	return string(bytes), err
}

func GenerateToken(email string, userId uuid.UUID) (string, error) {
	if secretKey == "" {
		return "", ErrorSecretKeyCannotBeEmpty
	}

	return jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":  email,
		"userId": userId.String(),
		"exp":    time.Now().Add(time.Hour * 2).Unix(),
	}).SignedString([]byte(secretKey))
}
