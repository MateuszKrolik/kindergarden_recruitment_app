package user

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
)

var ErrorMethodNotAllowed string = "Method not allowed!"

type userHandler struct {
	svc IUserService
}

func NewUserHandler(svc IUserService) *userHandler {
	return &userHandler{svc: svc}
}

func (h *userHandler) RegisterRoutes(
	mux *http.ServeMux,
	authenticator func(next http.Handler) http.Handler,
) {
	mux.HandleFunc("/signup", http.HandlerFunc(h.registerUser))
	mux.HandleFunc("/login", http.HandlerFunc(h.loginUser))
	mux.Handle(
		"/users/me/parent-details/",
		authenticator(http.HandlerFunc(h.saveParentUserDetails)),
	)
}

func (h *userHandler) registerUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	encoder := json.NewEncoder(w)

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user User
	if err := json.Unmarshal(body, &user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response, err := h.svc.RegisterUser(r.Context(), user.Email, user.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	encoder.Encode(response)
}

func (h *userHandler) loginUser(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodPost {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	type request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req request
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	token, err := h.svc.LoginUser(r.Context(), req.Email, req.Password)
	if err != nil {
		if err == ErrorUserNotFound {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	encoder.Encode(map[string]string{"token": token})
}

func (h *userHandler) saveParentUserDetails(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	userIdClaim := r.Context().Value("userId")
	if userIdClaim == "" {
		http.Error(w, "UserID cannot be empty!", http.StatusUnauthorized)
		return
	}

	userId, ok := userIdClaim.(uuid.UUID)
	if !ok {
		http.Error(w, "Invalid UserID!", http.StatusBadRequest)
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	type request struct {
		FirstName   string    `json:"first_name"`
		LastName    string    `json:"last_name"`
		Phone       string    `json:"phone"`
		PESEL       string    `json:"pesel"`
		BirthDate   time.Time `json:"birth_date"`
		HomeAddress string    `json:"home_address"`
		Workplace   string    `json:"workplace"`
		Gender      Gender    `json:"gender"`
		// Requirement flags
		IsEmployed                *bool `json:"is_employed"`
		IsSelfEmployed            *bool `json:"is_self_employed"`
		IsStudent                 *bool `json:"is_student"`
		FiledTaxInDesiredLocation *bool `json:"filed_tax_in_desired_location"`
		ResidesInDesiredLocation  *bool `json:"resides_in_desired_location"`
	}

	var req request
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	pU := ParentUserDetails{
		UserID:      userId,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Phone:       req.Phone,
		PESEL:       req.PESEL,
		BirthDate:   req.BirthDate,
		HomeAddress: req.HomeAddress,
		Workplace:   req.Workplace,
		Gender:      req.Gender,
		// Requirement flags
		IsEmployed:                req.IsEmployed,
		IsSelfEmployed:            req.IsSelfEmployed,
		IsStudent:                 req.IsStudent,
		FiledTaxInDesiredLocation: req.FiledTaxInDesiredLocation,
		ResidesInDesiredLocation:  req.ResidesInDesiredLocation,
	}

	if err := h.svc.SaveParentUserDetails(r.Context(), pU); err != nil {
		if err == ErrorUserNotFound {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(pU)
}
