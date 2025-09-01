package reporting

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var ErrorParentDocumentDoesntExist error = errors.New("Parent document doesn't exist!")

type IDocumentRepository interface {
	GetParentDocumentByID(c context.Context, documentID uuid.UUID) (*ParentDocument, error)
	DoesDocumentBelongToParent(c context.Context, userID, docID uuid.UUID) (bool, error)
	GetParentDocumentTypeByID(
		c context.Context,
		documentID uuid.UUID,
	) (*string, error)
}

type inMemoryDocumentRepository struct {
	ParentDocuments map[uuid.UUID]*ParentDocument
}

func NewInMemoryDocumentRepository() IDocumentRepository {
	return &inMemoryDocumentRepository{
		ParentDocuments: inMemoryParentDocuments,
	}
}

func (r *inMemoryDocumentRepository) GetParentDocumentByID(
	c context.Context,
	documentID uuid.UUID,
) (*ParentDocument, error) {
	document, exists := r.ParentDocuments[documentID]
	if !exists {
		return nil, ErrorParentDocumentDoesntExist
	}
	return document, nil
}

func (r *inMemoryDocumentRepository) DoesDocumentBelongToParent(
	c context.Context,
	userID, docID uuid.UUID,
) (bool, error) {
	document, exists := r.ParentDocuments[documentID]
	if !exists {
		return false, ErrorParentDocumentDoesntExist
	}
	if document.UserID != userID {
		return false, nil
	}
	return true, nil
}

func (r *inMemoryDocumentRepository) GetParentDocumentTypeByID(
	c context.Context,
	documentID uuid.UUID,
) (*string, error) {
	doc, err := r.GetParentDocumentByID(c, documentID)
	if err != nil {
		return nil, err
	}
	docType := string(doc.DocumentType)
	return &docType, nil
}
