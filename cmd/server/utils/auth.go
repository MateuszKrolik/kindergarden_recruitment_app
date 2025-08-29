package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

var secretKey string

func init() {
	godotenv.Load()
	secretKey = os.Getenv("SECRET_KEY")
}

func GenerateToken(email string, userId uuid.UUID) (string, error) {
	if secretKey == "" {
		return "", fmt.Errorf("Secret key cannot be empty.")
	}

	return jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":  email,
		"userId": userId.String(),
		"exp":    time.Now().Add(time.Hour * 2).Unix(),
	}).SignedString([]byte(secretKey))
}

func ParseToken(token string) (*jwt.Token, error) {
	if secretKey == "" {
		return nil, fmt.Errorf("Secret key cannot be empty.")
	}

	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method")
		}
		return []byte(secretKey), nil
	})

	return parsedToken, err
}
