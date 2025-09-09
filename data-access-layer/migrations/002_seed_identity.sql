BEGIN;

INSERT INTO identity.user (id, name, email, "emailVerified")
VALUES ('6ceaa734-b828-41ba-8351-a0198f64c089', 'Test User', 'test@test.com', true);

INSERT INTO identity.account (
  "accountId",
  "providerId",
  "userId",
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  '6ceaa734-b828-41ba-8351-a0198f64c089',           
  'credential',                      
  '6ceaa734-b828-41ba-8351-a0198f64c089', 
  '$2b$14$kUPbDjd1VqCVzW/NCS80gu9xafFEFF0LCtBWoxVFQhgUd.6xbv6He',       
  NOW(),
  NOW()
);

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


INSERT INTO identity.user (id, name, email, "emailVerified")
VALUES ('9a51a7b5-be68-4df2-aa1f-695ea1ce6aeb', 'Admin User', 'admin@test.com', true);

INSERT INTO identity.account (
  "accountId",
  "providerId",
  "userId",
  password,
  "createdAt",
  "updatedAt"
) VALUES (
  '9a51a7b5-be68-4df2-aa1f-695ea1ce6aeb',           
  'credential',                      
  '9a51a7b5-be68-4df2-aa1f-695ea1ce6aeb', 
  '$2b$14$kUPbDjd1VqCVzW/NCS80gu9xafFEFF0LCtBWoxVFQhgUd.6xbv6He',       
  NOW(),
  NOW()
);

COMMIT;
