package reporting

import (
	"fmt"

	"github.com/google/uuid"
)

var (
	documentID uuid.UUID = uuid.MustParse("eb04c874-71f9-43f4-a0c9-ecb52ec63dbe")
	parentID   uuid.UUID = uuid.MustParse("a804a417-b1a0-4ec3-af0f-c273cc833fb4")
)

var inMemoryParentDocuments map[uuid.UUID]*ParentDocument = map[uuid.UUID]*ParentDocument{
	documentID: {
		ID:           documentID,
		UserID:       parentID,
		DocumentType: EmploymentProof,
		FilePath:     stringPtr(fmt.Sprintf("/parents/%v/%v", parentID, EmploymentProof)),
	},
}

func stringPtr(s string) *string {
	return &s
}
