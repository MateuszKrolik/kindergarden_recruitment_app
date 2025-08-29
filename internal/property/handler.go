package property

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type propertyHandler struct {
	svc IPropertyService
}

func NewPropertyHandler(svc IPropertyService) *propertyHandler {
	return &propertyHandler{svc: svc}
}

func (h *propertyHandler) RegisterRoutes(
	mux *http.ServeMux,
	authenticator func(next http.Handler) http.Handler,
) {
	mux.Handle("/properties/{id}", authenticator(http.HandlerFunc(h.getPropertyById)))
	mux.Handle(
		"/properties/{id}/roles/{role}",
		authenticator(http.HandlerFunc(h.registerUserToProperty)),
	)
}

func (h *propertyHandler) getPropertyById(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed!", http.StatusMethodNotAllowed)
		return
	}

	propertyIdParam := strings.TrimPrefix(r.URL.Path, "/properties/")
	if propertyIdParam == "" {
		http.Error(w, "PropertyId cannot be empty!", http.StatusBadRequest)
		return
	}

	propertyId, err := uuid.Parse(propertyIdParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	property, err := h.svc.GetPropertyByID(r.Context(), propertyId)
	if err != nil {
		if err == ErrorPropertyNotFound {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder.Encode(property)
}

func (h *propertyHandler) registerUserToProperty(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed!", http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	propertyIdParam := pathParts[2]
	if propertyIdParam == "" {
		http.Error(w, "PropertyId cannot be empty!", http.StatusBadRequest)
		return
	}

	propertyId, err := uuid.Parse(propertyIdParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userIdClaim := r.Context().Value("userId")
	userId, ok := userIdClaim.(uuid.UUID)
	if !ok {
		http.Error(w, "Invalid userId!", http.StatusUnauthorized)
		return
	}

	roleParam := pathParts[4]
	if roleParam == "" {
		http.Error(w, "Role cannot be empty!", http.StatusBadRequest)
		return
	}

	userRole := UserRole(roleParam)
	if !userRole.IsValid() {
		http.Error(w, "Invalid user role!", http.StatusBadRequest)
		return
	}

	propertyUser, err := h.svc.RegisterUserToProperty(r.Context(), propertyId, userId, userRole)
	if err != nil {
		if err == ErrorPropertyNotFound || err == ErrUserDoesntExist {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	encoder.Encode(propertyUser)
}
