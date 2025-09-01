package property

type UserRole string

var (
	Admin  UserRole = "admin"
	Parent UserRole = "parent"
)

func (r UserRole) IsValid() bool {
	switch r {
	case Admin, Parent:
		return true
	}
	return false
}

type ConditionKey string

var (
	IsEmployed                ConditionKey = "is_employed"
	IsSelfEmployed            ConditionKey = "is_self_employed"
	IsStudent                 ConditionKey = "is_student"
	FiledTaxInDesiredLocation ConditionKey = "filed_tax_in_desired_location"
	ResidesInDesiredLocation  ConditionKey = "resides_in_desired_location"
)

func (cK ConditionKey) IsValid() bool {
	switch cK {
	case IsEmployed, IsSelfEmployed, IsStudent, FiledTaxInDesiredLocation, ResidesInDesiredLocation:
		return true
	}
	return false
}

type DocumentType string

var (
	EmploymentProof                DocumentType = "employment_proof"
	SelfEmploymentProof            DocumentType = "self_employment_proof"
	StudentProof                   DocumentType = "student_proof"
	FiledTaxInDesiredLocationProof DocumentType = "filed_tax_in_desired_location_proof"
	ResidesInDesiredLocationProof  DocumentType = "resides_in_desired_location_proof"
)

func (dT DocumentType) IsValid() bool {
	switch dT {
	case EmploymentProof,
		SelfEmploymentProof,
		StudentProof,
		FiledTaxInDesiredLocationProof,
		ResidesInDesiredLocationProof:
		return true
	}
	return false
}

type RequirementType string

var (
	Always      RequirementType = "always"
	Conditional RequirementType = "conditional"
)

func (rT RequirementType) IsValid() bool {
	switch rT {
	case Always, Conditional:
		return true
	}
	return false
}

type RequestStatus string

var (
	PendingStatus  RequestStatus = "pending"
	ApprovedStatus RequestStatus = "approved"
	RejectedStatus RequestStatus = "rejected"
)
