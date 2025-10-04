BEGIN;

CREATE SCHEMA IF NOT EXISTS compliance;

CREATE TABLE IF NOT EXISTS compliance.property_parent_documents(
  property_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_document_id uuid NOT NULL,
  request_status TEXT CHECK (request_status IN (
    'pending',
    'approved',
    'rejected'
  )) DEFAULT 'pending',
  approved_by uuid,
  PRIMARY KEY (property_id, user_id, parent_document_id)
);

CREATE TABLE IF NOT EXISTS compliance.property_children_documents(
  property_id uuid NOT NULL,
  child_id uuid NOT NULL,
  child_document_id uuid NOT NULL,
  request_status TEXT CHECK (request_status IN (
    'pending',
    'approved',
    'rejected'
  )) DEFAULT 'pending',
  approved_by uuid,
  PRIMARY KEY (property_id, child_id, child_document_id)
);

COMMIT;
