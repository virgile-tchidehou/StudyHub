# StudyHub Backend

Express.js API backend for the StudyHub platform — plain Node.js ESM, no build step, no ORM.

## Stack

- Node.js ≥ 18
- Express 4
- PostgreSQL (via `pg` Pool)
- Better Auth (email + password)
- Google Gemini + Groq (AI providers)
- Multer (file uploads → `../uploads/`)

## Getting started

Configuration is read from the **root** `.env` (shared with the frontend):

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `FRONTEND_URL`, `PORT`, `GEMINI_API_KEY`, `GROQ_API_KEY`

```bash
# From project root
npm install
npm run dev:all

# Or backend only
cd backend
npm run dev        # node server.js
```

Default: `http://localhost:8000`

## Structure

```
backend/
├── server.js
└── src/
    ├── config/
    │   ├── env.js
    │   ├── database.js
    │   ├── auth.js
    │   └── auth-schema.sql
    ├── middleware/
    │   └── auth.js
    ├── routes/
    │   ├── auth.js
    │   ├── goals.js
    │   ├── universities.js
    │   ├── documents.js
    │   ├── scholarships.js
    │   ├── planner.js
    │   ├── resources.js
    │   ├── flashcards.js
    │   ├── technical.js
    │   ├── profile.js
    │   ├── ai.js
    │   ├── gemini.js
    │   ├── chat-messages.js
    │   ├── learning.js
    │   └── learning-diagnostic.js
    └── services/learning/
        ├── context.js       # Learning Engine (state, priorities)
        └── diagnostic.js    # English diagnostic engine
        └── technical-diagnostic.js  # Technical skill diagnostic
```

## Database setup

```bash
psql -d studyhub_db -f backend/src/config/auth-schema.sql
psql -d studyhub_db -f database/schema.sql
```

For existing databases:

```bash
psql -d studyhub_db -f database/migrations/001_user_profile_no_fake_defaults.sql
```

## Auth

- Better Auth under `/api/auth/*`
- Session cookie: `better-auth.session_token` (HttpOnly)
- Business routes use `requireAuth` middleware and scope data by `user_id`

## Key endpoints

| Area | Prefix |
|------|--------|
| Core CRUD | `/api/goals`, `/api/universities`, `/api/documents`, … |
| AI | `/api/ai/ask`, `/api/ai/recommendations`, `/api/ai/daily-plan` |
| Learning | `/api/learning/state`, `/api/learning/priorities`, `/api/learning/summary` |
| Diagnostic | `/api/learning/diagnostic/english/*`, `/api/learning/diagnostic/technical/*` |
| Health | `GET /health` |

See the [root README](../README.md) for the full API reference.
