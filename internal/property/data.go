package property

import "github.com/google/uuid"

var (
	propertyID uuid.UUID = uuid.MustParse("7f472b5d-aead-437f-a7b6-32169c09e79b")
	parentID   uuid.UUID = uuid.MustParse("a804a417-b1a0-4ec3-af0f-c273cc833fb4")
	adminID    uuid.UUID = uuid.MustParse("01a1b6cf-d3c6-429c-b194-4c03162a2332")
)

var dummyInMemoryProperties map[uuid.UUID]*Property = map[uuid.UUID]*Property{
	propertyID: {ID: propertyID, Name: "property1"},
}

var dummyInMemoryPropertyUsers map[uuid.UUID]*PropertyUser = map[uuid.UUID]*PropertyUser{
	parentID: {PropertyID: propertyID, UserID: parentID, Role: Parent},
	adminID:  {PropertyID: propertyID, UserID: parentID, Role: Admin},
}
