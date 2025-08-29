package middleware

import (
	"context"
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/utils"
)

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token == "" {
			http.Error(w, "Unauthorized: JWT token cannot be empty.", http.StatusUnauthorized)
			return
		}

		parsedToken, err := utils.ParseToken(token)
		if err != nil {
			http.Error(
				w,
				fmt.Sprintf("Error while parsing JWT: %s", err.Error()),
				http.StatusUnauthorized,
			)
			return
		}

		if !parsedToken.Valid {
			http.Error(w, "Unauthorized: Invalid JWT token.", http.StatusUnauthorized)
			return
		}

		userId, err := uuid.Parse(parsedToken.Claims.(jwt.MapClaims)["userId"].(string))
		if err != nil {
			http.Error(
				w,
				fmt.Sprintf("Error while parsing userId UUID: %s", err.Error()),
				http.StatusUnauthorized,
			)
			return
		}

		ctx := context.WithValue(r.Context(), "userId", userId)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
