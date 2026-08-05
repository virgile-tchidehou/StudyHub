# StudyHub Backend

Express.js API backend for the StudyHub platform, written in plain Node.js (ESM, no build step).

## Stack

- Node.js >= 18
- Express 4
- PostgreSQL (via `pg`)
- Better Auth (email + password)
- dotenv

## Getting started

```bash
npm install
npm run dev        # or: npm start
```

The server reads configuration from the **root** `.env` (project root), shared with the frontend:
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `FRONTEND_URL`, `PORT`.

It listens on `http://localhost:8000` by default.

## Structure

```
backend/
├── server.js                 # Entry point (Express app)
├── src/
│   ├── config/
│   │   ├── env.js            # Loads + exposes env vars (root .env)
│   │   ├── database.js       # pg Pool + health check
│   │   ├── auth.js           # Better Auth instance
│   │   └── auth-schema.sql   # Better Auth SQL schema (apply to DB)
│   ├── middleware/
│   │   └── auth.js           # requireAuth + getSessionUser helpers
│   └── routes/
│       ├── auth.js           # Better Auth handler (/api/auth/*)
│       ├── goals.js          # /api/goals (protected)
│       ├── universities.js   # /api/universities (protected)
│       └── documents.js      # /api/documents (protected)
└── database/
    └── schema.sql            # Business tables (goals, universities, documents)
```

## Database setup

1. Create the database (e.g. `studyhub_db`).
2. Apply the schemas:

```bash
# Better Auth tables (user, session, account, verification)
psql -d studyhub_db -f backend/src/config/auth-schema.sql

# Business tables (goals, universities, documents)
psql -d studyhub_db -f database/schema.sql
```

## Auth

- Endpoints are served by Better Auth under `/api/auth/*`
  - `POST /api/auth/sign-up/email`
  - `POST /api/auth/sign-in/email`
  - `POST /api/auth/sign-out`
  - `GET  /api/auth/get-session`
- Session is stored in the `better-auth.session_token` cookie (HttpOnly).
- Business routes (`/api/goals`, `/api/universities`, `/api/documents`) require a valid session
  and are scoped per `user_id`.

## Health check

`GET /health` returns `{ status, timestamp, database, dbName }`.
