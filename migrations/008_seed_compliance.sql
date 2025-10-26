BEGIN;

INSERT INTO compliance.property_parent_documents(
  property_id,
  user_id,
  parent_document_id,
  document_type
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  '714e24af-9cff-4e35-b12b-f52dc3ec643c',
  'self_employment_proof'
);

INSERT INTO compliance.property_children_documents(
  property_id,
  child_id,
  child_document_id,
  document_type
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  '9e4f732a-3f0d-4348-8ade-b83e1e9a6346',
  'e0a4b370-449b-42dc-a821-9f3d66f376d4',
  'disability_proof'
);

COMMIT;
