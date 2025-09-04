package property

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

var (
	ErrorMethodNotAllowed           string = "Method not allowed!"
	ErrorPropertyIdCannotBeEmpty    string = "PropertyId cannot be empty!"
	ErrorChildIDCannotBeEmpty       string = "ChildID cannot be empty!"
	ErrorInvalidUserID              string = "Invalid userID!"
	ErrorRoleCannotBeEmpty          string = "Role cannot be empty!"
	ErrorInvalidUserRole            string = "Invalid user role!"
	ErrorParentUserDetailsDontExist string = "Parent user details don't exist!"
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
	mux.Handle(
		"/properties/{id}/users/me/parent-requirements",
		authenticator(http.HandlerFunc(h.getDocumentRequirementsForGivenPropertyParent)),
	)
	mux.Handle(
		"/properties/{id}/children/{childID}",
		authenticator(http.HandlerFunc(h.getPropertyChildByID)),
	)
	mux.Handle(
		"/properties",
		authenticator(http.HandlerFunc(h.getAllProperties)),
	)
	mux.Handle("/properties/{id}/users/me", authenticator(http.HandlerFunc(h.getPropertyUser)))
}

func (h *propertyHandler) getPropertyById(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodGet {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	propertyIdParam := strings.TrimPrefix(r.URL.Path, "/properties/")
	if propertyIdParam == "" {
		http.Error(w, ErrorPropertyIdCannotBeEmpty, http.StatusBadRequest)
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
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	propertyIdParam := pathParts[2]
	if propertyIdParam == "" {
		http.Error(w, ErrorPropertyIdCannotBeEmpty, http.StatusBadRequest)
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
		http.Error(w, ErrorInvalidUserID, http.StatusUnauthorized)
		return
	}

	roleParam := pathParts[4]
	if roleParam == "" {
		http.Error(w, ErrorRoleCannotBeEmpty, http.StatusBadRequest)
		return
	}

	userRole := UserRole(roleParam)
	if !userRole.IsValid() {
		http.Error(w, ErrorInvalidUserRole, http.StatusBadRequest)
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

func (h *propertyHandler) getDocumentRequirementsForGivenPropertyParent(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	userIDClaim := r.Context().Value("userId")
	userID, ok := userIDClaim.(uuid.UUID)
	if !ok {
		http.Error(w, ErrorInvalidUserID, http.StatusUnauthorized)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	propertyIDParam := pathParts[2]
	if propertyIDParam == "" {
		http.Error(w, ErrorPropertyIdCannotBeEmpty, http.StatusBadRequest)
		return
	}

	propertyID, err := uuid.Parse(propertyIDParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	requirements, err := h.svc.GetDocumentRequirementsForGivenPropertyParent(
		r.Context(),
		propertyID,
		userID,
	)
	if err != nil {
		if err.Error() == ErrorParentUserDetailsDontExist {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(requirements)
}

func (h *propertyHandler) getPropertyChildByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	// TODO: 403 Forbidden check
	pathParts := strings.Split(r.URL.Path, "/")
	propertyIDParam := pathParts[2]
	if propertyIDParam == "" {
		http.Error(w, ErrorPropertyIdCannotBeEmpty, http.StatusBadRequest)
		return
	}

	propertyID, err := uuid.Parse(propertyIDParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	childIDParam := pathParts[4]
	if childIDParam == "" {
		http.Error(w, ErrorChildIDCannotBeEmpty, http.StatusBadRequest)
		return
	}

	childID, err := uuid.Parse(childIDParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	child, err := h.svc.GetPropertyChildByID(r.Context(), propertyID, childID)
	if err != nil {
		if err == ErrorPropertyChildNotFound {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(child)
}

func (h *propertyHandler) getAllProperties(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodGet {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	queryParams := r.URL.Query()
	pageSizeStr := queryParams.Get("pageSize")
	pageSize, err := strconv.ParseInt(pageSizeStr, 10, 64)
	if err != nil {
		pageSize = 5
	}

	pageNumberStr := queryParams.Get("pageNumber")
	pageNumber, err := strconv.ParseInt(pageNumberStr, 10, 64)
	if err != nil {
		pageNumber = 5
	}

	properties, err := h.svc.GetAllProperties(r.Context(), pageNumber, pageSize)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder.Encode(properties)
}

func (h *propertyHandler) getPropertyUser(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodGet {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	userIdClaim := r.Context().Value("userId")
	userId, ok := userIdClaim.(uuid.UUID)
	if !ok {
		http.Error(w, ErrorInvalidUserID, http.StatusUnauthorized)
		return
	}

	params := strings.Split(r.URL.Path, "/")
	propertyId, err := uuid.Parse(params[2])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	propertyUser, err := h.svc.GetPropertyUser(r.Context(), propertyId, userId)
	if err != nil {
		if err == ErrorPropertyUserNotFound {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder.Encode(propertyUser)
}
