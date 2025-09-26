BEGIN;

INSERT INTO auth.user (id, name, email, "emailVerified")
VALUES ('6ceaa734-b828-41ba-8351-a0198f64c089', 'Test User', 'test@test.com', true);

INSERT INTO auth.account (
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

INSERT INTO auth.user (id, name, email, "emailVerified")
VALUES ('9a51a7b5-be68-4df2-aa1f-695ea1ce6aeb', 'Admin User', 'admin@test.com', true);

INSERT INTO auth.account (
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
