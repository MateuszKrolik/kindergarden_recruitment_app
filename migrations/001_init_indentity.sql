BEGIN;

CREATE SCHEMA IF NOT EXISTS identity;

create table identity."jwks" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "publicKey" text not null,
  "privateKey" text not null,
  "createdAt" timestamptz not null
);

create table identity."user" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamp default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamp default CURRENT_TIMESTAMP not null
);

create table identity."session" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid not null references identity."user" ("id") on delete cascade
);

create table identity."account" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" uuid not null references identity."user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamp not null
);

create table identity."verification" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamp not null,
  "createdAt" timestamp default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamp default CURRENT_TIMESTAMP not null
);


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

COMMIT;
