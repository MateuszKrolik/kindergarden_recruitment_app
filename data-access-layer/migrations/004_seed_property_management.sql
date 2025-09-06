BEGIN;

INSERT INTO property_management.properties(
  id,
  name,
  slug
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'property1',
  'property1'
);

INSERT INTO property_management.properties(
  id,
  name,
  slug
) VALUES (
  '89db3185-c98b-4271-9b4b-2c18965021ba',
  'property2',
  'property2'
);

INSERT INTO property_management.property_users(
  property_id,
  user_id,
  role
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  'parent'
);

INSERT INTO property_management.property_parent_document_requirements(
  property_id,
  document_type,
  requirement_type,
  condition_key,
  point_value
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'employment_proof',
  'conditional',
  'is_employed',
  5
);


INSERT INTO property_management.property_parent_document_requirements(
  property_id,
  document_type,
  requirement_type,
  condition_key,
  point_value
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'self_employment_proof',
  'conditional',
  'is_self_employed',
  5
);

INSERT INTO property_management.property_parent_document_requirements(
  property_id,
  document_type,
  requirement_type,
  condition_key,
  point_value
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'student_proof',
  'conditional',
  'is_student',
  5
);

INSERT INTO property_management.property_parent_document_requirements(
  property_id,
  document_type,
  requirement_type,
  condition_key,
  point_value
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'filed_tax_in_desired_location_proof',
  'conditional',
  'filed_tax_in_desired_location',
  5
);

INSERT INTO property_management.property_parent_document_requirements(
  property_id,
  document_type,
  requirement_type,
  condition_key,
  point_value
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'resides_in_desired_location_proof',
  'conditional',
  'resides_in_desired_location',
  5
);

COMMIT;
