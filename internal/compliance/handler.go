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
	ErrorInvalidUserID           string = "Invalid userID!"
	ErrorInvalidRequestStatus    string = "Invalid request status!"
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
	mux.Handle(
		"/properties/{propertyID}/parents/documents/{id}/status/{status}",
		authenticator(http.HandlerFunc(h.editPropertyParentDocApprovalRequestStatus)),
	)
	mux.Handle(
		"/properties/{propertyID}/parents/documents/requests",
		authenticator(http.HandlerFunc(h.getAllParentDocRequestsForGivenProperty)),
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

func (h *complianceHandler) editPropertyParentDocApprovalRequestStatus(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodPatch {
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

	userIdClaim := r.Context().Value("userId")
	adminID, ok := userIdClaim.(uuid.UUID)
	if !ok {
		http.Error(w, ErrorInvalidUserID, http.StatusUnauthorized)
		return
	}

	statusParam := pathParams[7]

	status := RequestStatus(statusParam)
	if !status.IsValid() {
		http.Error(w, ErrorInvalidRequestStatus, http.StatusBadRequest)
		return
	}

	if err := h.svc.EditPropertyParentDocApprovalRequestStatus(r.Context(), propertyID, adminID, documentID, status); err != nil {
		if err == ErrorRequestDoesntExist {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Request status updated succesfully!"})
}

func (h *complianceHandler) getAllParentDocRequestsForGivenProperty(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodGet {
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

	requests, err := h.svc.GetAllParentDocRequestsForGivenProperty(r.Context(), propertyID)
	if err != nil {
		// TODO: Return forbidden if not admin
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(requests)
}
