BEGIN;

CREATE SCHEMA IF NOT EXISTS reporting;

CREATE TABLE IF NOT EXISTS reporting.parent_documents(
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'employment_proof',
    'self_employment_proof',
    'student_proof',
    'filed_tax_in_desired_location_proof',
    'resides_in_desired_location_proof'
  )),
  file_path VARCHAR NOT NULL
);

COMMIT;
