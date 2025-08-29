package user

import (
	"encoding/json"
	"io"
	"net/http"
)

type userHandler struct {
	svc IUserService
}

func NewUserHandler(svc IUserService) *userHandler {
	return &userHandler{svc: svc}
}

func (h *userHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/signup", http.HandlerFunc(h.registerUser))
	mux.HandleFunc("/login", http.HandlerFunc(h.loginUser))
}

func (h *userHandler) registerUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed!", http.StatusMethodNotAllowed)
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
		http.Error(w, "Method not allowed!", http.StatusMethodNotAllowed)
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
