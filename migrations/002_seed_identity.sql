BEGIN;

INSERT INTO identity.parent_user_details(
  user_id,
  first_name,
  last_name,
  phone,
  pesel,
  birth_date,
  home_address,
  workplace,
  gender,
  -- condition keys
  is_employed,
  is_self_employed,
  is_student,
  filed_tax_in_desired_location,
  resides_in_desired_location
) VALUES (
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  'Test',
  'User',
  '+48 888 888 888',
  '1234',
  NOW(),
  'Random City, Random Street',
  'Random City, Random Street',
  'male',
  -- condition keys
  false,
  true,
  false,
  true,
  true
);


INSERT INTO identity.children(
  id,
  has_disability
) VALUES (
  '9e4f732a-3f0d-4348-8ade-b83e1e9a6346',
  true
);

INSERT INTO identity.parent_children(
  parent_id,
  child_id
) VALUES (
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  '9e4f732a-3f0d-4348-8ade-b83e1e9a6346'
);

INSERT INTO identity.children(
  id,
  has_disability
) VALUES (
  'd6b6c283-fdaa-4379-b7fd-b431fd668656',
  false
);

INSERT INTO identity.parent_children(
  parent_id,
  child_id
) VALUES (
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  'd6b6c283-fdaa-4379-b7fd-b431fd668656'
);

INSERT INTO identity.property_users(
  property_id,
  user_id,
  role
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  '6ceaa734-b828-41ba-8351-a0198f64c089',
  'parent'
);

INSERT INTO identity.property_users(
  property_id,
  user_id,
  role
) VALUES (
  'b2979118-9963-4b97-aa56-c9d25a8b4acf',
  '9a51a7b5-be68-4df2-aa1f-695ea1ce6aeb',
  'admin'
);

COMMIT;
