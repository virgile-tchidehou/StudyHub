-- Better Auth schema for PostgreSQL
-- Reference: https://www.better-auth.com/docs/concepts/database

CREATE TABLE IF NOT EXISTS "user" (
  "id" varchar(255) NOT NULL PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "emailVerified" boolean DEFAULT false NOT NULL,
  "image" varchar(255),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" varchar(255) NOT NULL PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" varchar(255) NOT NULL UNIQUE,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "ipAddress" varchar(255),
  "userAgent" varchar(255),
  "userId" varchar(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" varchar(255) NOT NULL PRIMARY KEY,
  "accountId" varchar(255) NOT NULL,
  "providerId" varchar(255) NOT NULL,
  "userId" varchar(255) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" varchar(255),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" varchar(255) NOT NULL PRIMARY KEY,
  "identifier" varchar(255) NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
