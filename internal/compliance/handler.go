package compliance

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

var (
	ErrorMethodNotAllowed        string = "Invalid http method!"
	ErrorPropertyIDCannotBeEmpty string = "PropertyID cannot be empty!"
	ErrorInvalidPropertyID       string = "Invalid DocumentID!"
	ErrorDocumentIDCannotBeEmpty string = "DocumentID cannot be empty!"
	ErrorInvalidDocumentID       string = "Invalid DocumentID!"
)

type complianceHandler struct {
	svc IComplianceService
}

func NewComplianceHandler(svc IComplianceService) *complianceHandler {
	return &complianceHandler{
		svc: svc,
	}
}

func (h *complianceHandler) RegisterRoutes(
	mux *http.ServeMux,
	authenticator func(next http.Handler) http.Handler,
) {
	mux.Handle(
		"/properties/{propertyID}/parents/documents/{id}/request-approval",
		authenticator(http.HandlerFunc(h.sendPropertyParentDocApprovalRequest)),
	)
}

func (h *complianceHandler) sendPropertyParentDocApprovalRequest(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodPost {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	pathParams := strings.Split(r.URL.Path, "/")

	propertyIDPathParam := pathParams[2]
	if propertyIDPathParam == "" {
		http.Error(w, ErrorPropertyIDCannotBeEmpty, http.StatusBadRequest)
		return
	}

	propertyID, err := uuid.Parse(propertyIDPathParam)
	if err != nil {
		http.Error(w, ErrorInvalidPropertyID, http.StatusBadRequest)
		return
	}

	documentIDPathParam := pathParams[5]
	if documentIDPathParam == "" {
		http.Error(w, ErrorDocumentIDCannotBeEmpty, http.StatusBadRequest)
		return
	}

	documentID, err := uuid.Parse(documentIDPathParam)
	if err != nil {
		http.Error(w, ErrorInvalidDocumentID, http.StatusBadRequest)
		return
	}

	docRequest := PropertyParentDocument{
		PropertyID:       propertyID,
		ParentDocumentID: documentID,
		Status:           PendingStatus,
	}

	if err = h.svc.SavePropertyParentDocApprovalRequest(r.Context(), &docRequest); err != nil {
		if err == ErrorRequestAlreadyExists {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(docRequest)
}
