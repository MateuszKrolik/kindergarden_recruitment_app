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

func (h *userHandler) loginUser(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		encoder.Encode(map[string]string{"error": "Method not allowed!"})
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		encoder.Encode(map[string]string{"error": err.Error()})
		return
	}

	type request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req request
	if err := json.Unmarshal(body, &req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		encoder.Encode(map[string]string{"error": err.Error()})
		return
	}

	token, err := h.svc.LoginUser(r.Context(), req.Email, req.Password)
	if err != nil {
		if err == ErrorUserNotFound {
			w.WriteHeader(http.StatusNotFound)
			encoder.Encode(map[string]string{"error": err.Error()})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		encoder.Encode(map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
	encoder.Encode(map[string]string{"token": token})
}
