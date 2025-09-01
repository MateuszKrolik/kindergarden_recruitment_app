package reporting

import (
	"context"

	"github.com/google/uuid"
)

type IDocumentService interface {
	GetParentDocumentByID(c context.Context, documentID uuid.UUID) (*ParentDocument, error)
	GetParentDocumentTypeByID(c context.Context, documentID uuid.UUID) (*string, error)
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

func (s *documentService) GetParentDocumentTypeByID(
	c context.Context,
	documentID uuid.UUID,
) (*string, error) {
	return s.repo.GetParentDocumentTypeByID(c, documentID)
}
