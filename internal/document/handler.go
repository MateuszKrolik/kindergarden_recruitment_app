package document

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

var (
	ErrorMethodNotAllowed        string = "Invalid http method!"
	ErrorDocumentIDCannotBeEmpty string = "DocumentID cannot be empty!"
)

type documentHandler struct {
	svc IDocumentService
}

func NewDocumentHandler(svc IDocumentService) *documentHandler {
	return &documentHandler{svc: svc}
}

func (h *documentHandler) RegisterRoutes(
	mux *http.ServeMux,
	authenticator func(next http.Handler) http.Handler,
) {
	mux.Handle(
		"/parents/documents/{id}",
		authenticator(http.HandlerFunc(h.getParentDocumentByID)),
	)
	// TODO: File upload & Signed URLs
}

func (h *documentHandler) getParentDocumentByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, ErrorMethodNotAllowed, http.StatusMethodNotAllowed)
		return
	}

	pathParams := strings.Split(r.URL.Path, "/")
	documentIDPathParam := pathParams[3]
	if documentIDPathParam == "" {
		http.Error(w, ErrorDocumentIDCannotBeEmpty, http.StatusBadRequest)
		return
	}

	documentID, err := uuid.Parse(documentIDPathParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	document, err := h.svc.GetParentDocumentByID(r.Context(), documentID)
	if err != nil {
		if err == ErrorParentDocumentDoesntExist {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(document)
}
