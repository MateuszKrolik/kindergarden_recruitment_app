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
	mux.Handle("/properties/", authenticator(http.HandlerFunc(h.getPropertyById)))
}

func (h *propertyHandler) getPropertyById(w http.ResponseWriter, r *http.Request) {
	encoder := json.NewEncoder(w)
	if r.Method != http.MethodGet {
		encoder.Encode(map[string]string{"error": "Method not allowed!"})
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	propertyIdParam := strings.TrimPrefix(r.URL.Path, "/properties/")
	if propertyIdParam == "" {
		w.WriteHeader(http.StatusBadRequest)
		encoder.Encode(map[string]string{"error": "PropertyId cannot be empty!"})
		return
	}

	propertyId, err := uuid.Parse(propertyIdParam)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		encoder.Encode(map[string]string{"error": err.Error()})
		return
	}

	property, err := h.svc.GetPropertyByID(r.Context(), propertyId)
	if err != nil {
		if err == ErrorPropertyNotFound {
			w.WriteHeader(http.StatusNotFound)
			encoder.Encode(map[string]string{"error": err.Error()})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		encoder.Encode(map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	encoder.Encode(property)
}
