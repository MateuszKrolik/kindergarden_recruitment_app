package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/MateuszKrolik/kindergarden_recruitment_app/cmd/server/adapter"
	"github.com/MateuszKrolik/kindergarden_recruitment_app/cmd/server/bus"
	"github.com/MateuszKrolik/kindergarden_recruitment_app/cmd/server/middleware"
	"github.com/MateuszKrolik/kindergarden_recruitment_app/internal/compliance"
	"github.com/MateuszKrolik/kindergarden_recruitment_app/internal/identity"
	"github.com/MateuszKrolik/kindergarden_recruitment_app/internal/property"
	"github.com/MateuszKrolik/kindergarden_recruitment_app/internal/reporting"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	mux := http.NewServeMux()
	authenticator := middleware.Authenticate
	bus := bus.NewInMemoryEventBus()

	// Identity Management
	userRepo := identity.NewInMemoryUserRepository()
	userSvc := identity.NewUserService(userRepo)
	userHandler := identity.NewUserHandler(userSvc)
	userHandler.RegisterRoutes(mux, authenticator)

	// Reporting
	docRepo := reporting.NewInMemoryDocumentRepository()
	docSvc := reporting.NewDocumentService(docRepo)
	docHandler := reporting.NewDocumentHandler(docSvc)
	docHandler.RegisterRoutes(mux, authenticator)

	// Property Management
	propertyRepo := property.NewInMemoryPropertyRepository()
	propertyUserClientAdapter := adapter.NewPropertyUserClientAdapter(userSvc)
	propertySvc := property.NewPropertyService(propertyRepo, propertyUserClientAdapter, docSvc)
	propertyHandler := property.NewPropertyHandler(propertySvc)
	propertyHandler.RegisterRoutes(mux, authenticator)
	property.RegisterEventHandlers(bus, propertySvc, docSvc, logger)

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
