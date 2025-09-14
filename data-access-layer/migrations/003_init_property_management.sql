BEGIN;

CREATE SCHEMA IF NOT EXISTS property_management;

CREATE TABLE IF NOT EXISTS property_management.properties(
  id uuid DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS property_management.property_users(
  property_id uuid DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  role TEXT CHECK (role IN ('admin', 'parent')),
  PRIMARY KEY (property_id, user_id)
);

CREATE TABLE IF NOT EXISTS property_management.property_parent_document_requirements(
  property_id uuid DEFAULT gen_random_uuid(),
  document_type TEXT CHECK (document_type IN (
    'employment_proof',
    'self_employment_proof',
    'student_proof',
    'filed_tax_in_desired_location_proof',
    'resides_in_desired_location_proof'
  )),
  requirement_type TEXT CHECK (requirement_type IN (
    'always',
    'conditional'
  )),
  condition_key TEXT CHECK (condition_key IN (
    'is_employed',
    'is_self_employed',
    'is_student',
    'filed_tax_in_desired_location',
    'resides_in_desired_location'
  )),
  point_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS property_management.property_children(
  property_id uuid NOT NULL,
  child_id uuid NOT NULL,
  points INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  PRIMARY KEY (property_id, child_id)
);

COMMIT;
