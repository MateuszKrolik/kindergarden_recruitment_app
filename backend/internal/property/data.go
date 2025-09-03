package property

import "github.com/google/uuid"

var (
	propertyID  uuid.UUID = uuid.MustParse("7f472b5d-aead-437f-a7b6-32169c09e79b")
	propertyID2 uuid.UUID = uuid.MustParse("446b8aa1-a001-4204-8d71-c1103756537b")
	parentID    uuid.UUID = uuid.MustParse("a804a417-b1a0-4ec3-af0f-c273cc833fb4")
	adminID     uuid.UUID = uuid.MustParse("01a1b6cf-d3c6-429c-b194-4c03162a2332")
	childID     uuid.UUID = uuid.MustParse("446b8aa1-a001-4204-8d71-c1103756537b")
)

var dummyInMemoryProperties map[uuid.UUID]*Property = map[uuid.UUID]*Property{
	propertyID:  {ID: propertyID, Name: "property1"},
	propertyID2: {ID: propertyID2, Name: "property2"},
}

var dummyInMemoryPropertyUsers map[uuid.UUID]*PropertyUser = map[uuid.UUID]*PropertyUser{
	parentID: {PropertyID: propertyID, UserID: parentID, Role: Parent},
	adminID:  {PropertyID: propertyID, UserID: adminID, Role: Admin},
}

var inMemoryPropertyParentDocumentRequirements []PropertyParentDocumentRequirement = []PropertyParentDocumentRequirement{
	{
		PropertyID:      propertyID,
		DocumentType:    EmploymentProof,
		RequirementType: Conditional,
		ConditionKey:    IsEmployed,
		PointValue:      5,
	},
	{
		PropertyID:      propertyID,
		DocumentType:    SelfEmploymentProof,
		RequirementType: Conditional,
		ConditionKey:    IsSelfEmployed,
		PointValue:      5,
	},
	{
		PropertyID:      propertyID,
		DocumentType:    StudentProof,
		RequirementType: Conditional,
		ConditionKey:    IsStudent,
		PointValue:      5,
	},
	{
		PropertyID:      propertyID,
		DocumentType:    FiledTaxInDesiredLocationProof,
		RequirementType: Conditional,
		ConditionKey:    FiledTaxInDesiredLocation,
		PointValue:      5,
	},
	{
		PropertyID:      propertyID,
		DocumentType:    ResidesInDesiredLocationProof,
		RequirementType: Conditional,
		ConditionKey:    ResidesInDesiredLocation,
		PointValue:      5,
	},
}

var inMemoryPropertyChildren map[uuid.UUID]*PropertyChild = map[uuid.UUID]*PropertyChild{
	childID: {ChildID: childID, PropertyID: propertyID, Points: 0},
}
