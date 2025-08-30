package document

import (
	"context"

	"github.com/google/uuid"
)

type IDocumentService interface {
	GetParentDocumentByID(c context.Context, documentID uuid.UUID) (*ParentDocument, error)
}

type documentService struct {
	repo IDocumentRepository
}

func NewDocumentService(repository IDocumentRepository) IDocumentService {
	return &documentService{
		repo: repository,
	}
}

func (s *documentService) GetParentDocumentByID(
	c context.Context,
	documentID uuid.UUID,
) (*ParentDocument, error) {
	return s.repo.GetParentDocumentByID(c, documentID)
}
