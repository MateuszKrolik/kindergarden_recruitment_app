package utils

import (
	"errors"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

var (
	secretKey                    string
	ErrorUnexpectedSigningMethod error = errors.New("Unexpected signing method!")
	ErrorSecretKeyCannotBeEmpty  error = errors.New("Secret key cannot be empty!")
)

func init() {
	godotenv.Load()
	secretKey = os.Getenv("SECRET_KEY")
}

func ParseToken(token string) (*jwt.Token, error) {
	if secretKey == "" {
		return nil, ErrorSecretKeyCannotBeEmpty
	}

	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrorUnexpectedSigningMethod
		}
		return []byte(secretKey), nil
	})

	return parsedToken, err
}
