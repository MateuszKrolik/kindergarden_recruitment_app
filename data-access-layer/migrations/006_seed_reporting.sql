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

COMMIT; 
