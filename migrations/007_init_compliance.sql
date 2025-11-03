BEGIN;

CREATE SCHEMA IF NOT EXISTS compliance;

CREATE TABLE IF NOT EXISTS compliance.property_parent_documents(
  property_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_document_id uuid NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'employment_proof',
    'self_employment_proof',
    'student_proof',
    'filed_tax_in_desired_location_proof',
    'resides_in_desired_location_proof'
  )) NOT NULL,
  request_status TEXT CHECK (request_status IN (
    'pending',
    'approved',
    'rejected'
  )) DEFAULT 'pending',
  point_value INTEGER NOT NULL,
  -- REQUESTOR DATA
  requestor_id uuid NOT NULL,
  requestor_name TEXT NOT NULL,
  requestor_email TEXT NOT NULL,
  -- APPROVER DATA
  approved_by uuid,
  approved_by_name TEXT,
  approved_by_email TEXT,
  rejection_reason TEXT,
  PRIMARY KEY (property_id, user_id, parent_document_id)
);

CREATE TABLE IF NOT EXISTS compliance.property_children_documents(
  property_id uuid NOT NULL,
  child_id uuid NOT NULL,
  child_document_id uuid NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'disability_proof',
    'single_parent_family_proof'
  )) NOT NULL,
  request_status TEXT CHECK (request_status IN (
    'pending',
    'approved',
    'rejected'
  )) DEFAULT 'pending',
  point_value INTEGER NOT NULL,
  -- REQUESTOR DATA
  requestor_id uuid NOT NULL,
  requestor_name TEXT NOT NULL,
  requestor_email TEXT NOT NULL,
  -- APPROVER DATA
  approved_by uuid,
  approved_by_name TEXT,
  approved_by_email TEXT,
  rejection_reason TEXT,
  PRIMARY KEY (property_id, child_id, child_document_id)
);

CREATE TABLE IF NOT EXISTS compliance.property_parent_partner_documents(
  property_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  parent_partner_document_id uuid NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'employment_proof',
    'self_employment_proof',
    'student_proof',
    'filed_tax_in_desired_location_proof',
    'resides_in_desired_location_proof'
  )) NOT NULL,
  request_status TEXT CHECK (request_status IN (
    'pending',
    'approved',
    'rejected'
  )) DEFAULT 'pending',
  point_value INTEGER NOT NULL,
  -- REQUESTOR DATA
  requestor_id uuid NOT NULL,
  requestor_name TEXT NOT NULL,
  requestor_email TEXT NOT NULL,
  -- APPROVER DATA
  approved_by uuid,
  approved_by_name TEXT,
  approved_by_email TEXT,
  rejection_reason TEXT,
  PRIMARY KEY (property_id, partner_id, parent_partner_document_id)
);

COMMIT;
