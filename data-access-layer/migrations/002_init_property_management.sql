BEGIN;

CREATE SCHEMA IF NOT EXISTS property_management;

CREATE TABLE IF NOT EXISTS property_management.properties(
  id uuid DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  PRIMARY KEY(id)
);

COMMIT;
