package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/middleware"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/user"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	mux := http.NewServeMux()

	// Users
	userRepo := user.NewInMemoryUserRepository()
	userSvc := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userSvc)
	userHandler.RegisterRoutes(mux)

	handler := middleware.CORS(middleware.Logging(logger, mux))
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
