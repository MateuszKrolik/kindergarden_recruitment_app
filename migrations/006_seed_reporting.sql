BEGIN;

INSERT INTO reporting.parent_documents(
  id,
  user_id,
  document_type,
  file_path 
) VALUES (
  '714e24af-9cff-4e35-b12b-f52dc3ec643c',
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  'self_employment_proof',
  'parents/6ceaa734-b828-41ba-8351-a0198f64c089/self_employment_proof.pdf'
);

INSERT INTO reporting.parent_documents(
  id,
  user_id,
  document_type,
  file_path 
) VALUES (
  'fbb60f2e-3e6b-4491-ac41-ce8854d4425a',
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  'filed_tax_in_desired_location_proof',
  'parents/6ceaa734-b828-41ba-8351-a0198f64c089/filed_tax_in_desired_location_proof.pdf'
);

INSERT INTO reporting.children_documents(
  id,
  child_id,
  document_type,
  file_path 
) VALUES (
  '5f21929f-ce8c-4a29-ac87-3d4949bc5567',
  '9e4f732a-3f0d-4348-8ade-b83e1e9a6346',
  'disability_proof',
  'children/9e4f732a-3f0d-4348-8ade-b83e1e9a6346/disability_proof.pdf'
);

INSERT INTO reporting.children_documents(
  id,
  child_id,
  document_type,
  file_path 
) VALUES (
  'fee98e51-7179-44a0-ae44-30f78332f9df',
  '9e4f732a-3f0d-4348-8ade-b83e1e9a6346',
  'single_parent_family_proof',
  'children/9e4f732a-3f0d-4348-8ade-b83e1e9a6346/single_parent_family_proof.pdf'
);

COMMIT; 
