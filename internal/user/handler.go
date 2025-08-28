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

func (h *userHandler) RegisterRoutes() {
	http.HandleFunc("/users", h.registerUser)
}

func (h *userHandler) registerUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	encoder := json.NewEncoder(w)

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		encoder.Encode(err.Error())
		return
	}

	var user User
	if err := json.Unmarshal(body, &user); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		encoder.Encode(err.Error())
		return
	}

	response, err := h.svc.RegisterUser(r.Context(), user.Email, user.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		encoder.Encode(err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
	encoder.Encode(response)
}
