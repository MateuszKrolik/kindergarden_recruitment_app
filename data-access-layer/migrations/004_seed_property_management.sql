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

COMMIT;
