BEGIN;

CREATE SCHEMA IF NOT EXISTS identity; 

create table identity."user" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamp default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamp default CURRENT_TIMESTAMP not null
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

COMMIT;
