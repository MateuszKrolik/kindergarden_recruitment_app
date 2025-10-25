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

INSERT INTO property_management.property_children(
  property_id,
  child_id
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  '9e4f732a-3f0d-4348-8ade-b83e1e9a6346'
);

INSERT INTO property_management.property_children(
  property_id,
  child_id
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'd6b6c283-fdaa-4379-b7fd-b431fd668656'
);

INSERT INTO property_management.property_children_document_requirements(
  property_id,
  document_type,
  requirement_type,
  condition_key, 
  point_value
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'disability_proof',
  'conditional',
  'has_disability',
  11
);

INSERT INTO property_management.property_children_document_requirements(
  property_id,
  document_type,
  requirement_type,
  condition_key, 
  point_value
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  'single_parent_family_proof',
  'conditional',
  'is_from_single_parent_family',
  20
);

COMMIT;
