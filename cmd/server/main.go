package main

import (
	"net/http"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/user"
)

func main() {
	// Users
	userRepo := user.NewInMemoryUserRepository()
	userSvc := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userSvc)
	userHandler.RegisterRoutes()

	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}
