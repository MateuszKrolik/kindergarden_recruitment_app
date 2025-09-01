package reporting

import "github.com/google/uuid"

type ParentDocument struct {
	ID           uuid.UUID    `json:"id"`
	UserID       uuid.UUID    `json:"user_id"`
	DocumentType DocumentType `json:"document_type"`
	FilePath     *string      `json:"file_path"`
}
