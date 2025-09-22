export const DOCUMENT_TYPE = {
  EmploymentProof: "employment_proof",
  SelfEmploymentProof: "self_employment_proof",
  StudentProof: "student_proof",
  FiledTaxInDesiredLocationProof: "filed_tax_in_desired_location_proof",
  ResidesInDesiredLocationProof: "resides_in_desired_location_proof",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export const CHILD_DOCUMENT_TYPE = {
  DisabilityProof: "disability_proof",
} as const;

export type ChildDocumentType =
  (typeof CHILD_DOCUMENT_TYPE)[keyof typeof CHILD_DOCUMENT_TYPE];
