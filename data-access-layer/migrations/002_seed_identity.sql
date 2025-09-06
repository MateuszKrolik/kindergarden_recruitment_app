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

COMMIT;
