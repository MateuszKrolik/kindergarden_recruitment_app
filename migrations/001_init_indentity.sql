BEGIN;

CREATE SCHEMA IF NOT EXISTS identity;


CREATE TABLE IF NOT EXISTS identity.parent_user_details(
  user_id uuid DEFAULT gen_random_uuid() primary key,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  pesel VARCHAR NOT NULL,
  birth_date DATE NOT NULL,
  home_address VARCHAR NOT NULL,
  workplace VARCHAR,
  gender TEXT CHECK (gender IN ('male', 'female')),
  -- condition keys
  is_employed BOOLEAN,
  is_self_employed BOOLEAN,
  is_student BOOLEAN,
  filed_tax_in_desired_location BOOLEAN,
  resides_in_desired_location BOOLEAN
);


CREATE TABLE IF NOT EXISTS identity.children(
  id uuid DEFAULT gen_random_uuid() primary key,
  has_disability BOOLEAN
);

CREATE TABLE IF NOT EXISTS identity.parent_children(
  parent_id uuid NOT NULL,
  child_id uuid NOT NULL,
  PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE IF NOT EXISTS identity.property_users(
  property_id uuid DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  role TEXT CHECK (role IN ('admin', 'parent')),
  PRIMARY KEY (property_id, user_id)
);

COMMIT;
