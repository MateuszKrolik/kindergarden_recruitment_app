package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/adapter"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/bus"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/middleware"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/compliance"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/document"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/property"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/internal/user"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	mux := http.NewServeMux()
	authenticator := middleware.Authenticate
	bus := bus.NewInMemoryEventBus()

	// Users
	userRepo := user.NewInMemoryUserRepository()
	userSvc := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userSvc)
	userHandler.RegisterRoutes(mux, authenticator)

	// Documents
	docRepo := document.NewInMemoryDocumentRepository()
	docSvc := document.NewDocumentService(docRepo)
	docHandler := document.NewDocumentHandler(docSvc)
	docHandler.RegisterRoutes(mux, authenticator)

	// Properties
	propertyRepo := property.NewInMemoryPropertyRepository()
	propertyUserClientAdapter := adapter.NewPropertyUserClientAdapter(userSvc)
	propertySvc := property.NewPropertyService(propertyRepo, propertyUserClientAdapter, docSvc)
	propertyHandler := property.NewPropertyHandler(propertySvc)
	propertyHandler.RegisterRoutes(mux, authenticator)
	propertyParentDocumentStatusUpdatedEventHandler := property.NewPropertyParentDocumentStatusUpdatedEventHandler(
		bus,
		propertySvc,
		docSvc,
		logger,
	)

	bus.Subscribe(
		propertyParentDocumentStatusUpdatedEventHandler.EventName(),
		propertyParentDocumentStatusUpdatedEventHandler.Name(),
		propertyParentDocumentStatusUpdatedEventHandler.Handle,
	)

	// Compliance
	complianceRepo := compliance.NewInMemoryComplianceRepository()
	complianceSvc := compliance.NewComplianceService(complianceRepo, propertySvc, bus)
	complianceHandler := compliance.NewComplianceHandler(complianceSvc)
	complianceHandler.RegisterRoutes(mux, authenticator)

	handler := middleware.CORS(middleware.Logging(logger, mux))
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
