package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/httputils"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/utils"
)

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token == "" {
			respondWithError(w, http.StatusUnauthorized, "Unauthorized: JWT token cannot be empty.")
			return
		}

		parsedToken, err := utils.ParseToken(token)
		if err != nil {
			respondWithError(
				w,
				http.StatusUnauthorized,
				fmt.Sprintf("Error while parsing JWT: %s", err.Error()),
			)
			return
		}

		if !parsedToken.Valid {
			respondWithError(w, http.StatusUnauthorized, "Unauthorized: Invalid JWT token.")
			return
		}

		userId, err := uuid.Parse(parsedToken.Claims.(jwt.MapClaims)["userId"].(string))
		if err != nil {
			respondWithError(
				w,
				http.StatusUnauthorized,
				fmt.Sprintf("Error while parsing userId UUID: %s", err.Error()),
			)
			return
		}

		// Store userId in request context
		ctx := context.WithValue(r.Context(), "userId", userId)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Helper function to send JSON error responses
func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(httputils.HTTPError{
		Code:    code,
		Message: message,
	})
}
