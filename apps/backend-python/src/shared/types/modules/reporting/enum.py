from enum import StrEnum


class DOCUMENT_TYPE(StrEnum):
    employment_proof = "employment_proof"
    self_employment_proof = ("self_employment_proof",)
    student_proof = "student_proof"
    filed_tax_in_desired_location_proof = "filed_tax_in_desired_location_proof"
    resides_in_desired_location_proof = "resides_in_desired_location_proof"


class CHILD_DOCUMENT_TYPE(StrEnum):
    disability_proof = "disability_proof"
