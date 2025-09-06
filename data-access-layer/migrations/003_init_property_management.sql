BEGIN;

CREATE SCHEMA IF NOT EXISTS property_management;

CREATE TABLE IF NOT EXISTS property_management.properties(
  id uuid DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  PRIMARY KEY(id)
);


CREATE TABLE IF NOT EXISTS property_management.property_users(
  property_id uuid DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  role TEXT CHECK (role IN ('admin', 'parent')),
  PRIMARY KEY (property_id, user_id)
);

COMMIT;
