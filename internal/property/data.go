package property

import "github.com/google/uuid"

var id1 uuid.UUID = uuid.MustParse("7f472b5d-aead-437f-a7b6-32169c09e79b")

var dummyInMemoryProperties map[uuid.UUID]*Property = map[uuid.UUID]*Property{
	id1: {ID: id1, Name: "property1"},
}
