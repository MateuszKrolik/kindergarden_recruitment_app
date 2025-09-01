package reporting

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
