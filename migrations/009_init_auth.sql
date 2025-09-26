BEGIN;

CREATE SCHEMA IF NOT EXISTS auth;

create table auth."jwks" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "publicKey" text not null,
  "privateKey" text not null,
  "createdAt" timestamptz not null
);

create table auth."user" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamp default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamp default CURRENT_TIMESTAMP not null
);

create table auth."session" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid not null references auth."user" ("id") on delete cascade
);

create table auth."account" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" uuid not null references auth."user" ("id") on delete cascade,
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

create table auth."verification" (
  "id" uuid DEFAULT gen_random_uuid() primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamp not null,
  "createdAt" timestamp default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamp default CURRENT_TIMESTAMP not null
);


COMMIT;
