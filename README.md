<div align="center">

# 🎓 StudyHub

### Your AI-Powered Companion for International Studies

[![License: MIT](https://img.shields.io/badge/License-MIT-2ea44f.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Active-blue.svg)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-43853d?logo=node.js)
![Database](https://img.shields.io/badge/Database-PostgreSQL-316192?logo=postgresql)
![Auth](https://img.shields.io/badge/Auth-Better%20Auth-FF6B6B)

**AI • Education • Productivity • Scholarships • English Learning • Adaptive Learning**

</div>

---

# 📖 Overview

StudyHub is an AI-powered web platform designed to help students prepare for international studies.
Instead of juggling Google Drive, Notion, Duolingo, ChatGPT, calendars, and university websites, StudyHub brings everything into a single intelligent workspace:

- Application tracking (goals, universities, documents, scholarships)
- AI English Coach and English diagnostic
- AI Mentor (admission, interview, strategy)
- Technical learning roadmaps (Embedded Systems, IoT, Robotics)
- Daily AI plan with action tracking
- Adaptive Learning Engine (state, priorities, progression)
- Planner, resources library, and analytics

**Slogan:** *One Platform. One Goal. Your Future.*

Product vision: [`docs/01-product-vision.md`](docs/01-product-vision.md)

---

# 🏗 Architecture

```
                        StudyHub Platform

                     ┌────────────────────┐
                     │   Next.js App      │   Frontend (UI, dashboard, i18n FR/EN)
                     │   (port 3000)      │
                     └─────────┬──────────┘
                               │  /api/* proxied (same-origin cookies)
                     ┌─────────▼──────────┐
                     │   Express API      │   Backend (ESM, no build step)
                     │   (port 8000)      │
                     └─────────┬──────────┘
                               │
            ┌──────────────────┼───────────────────┐
            ▼                  ▼                    ▼
     PostgreSQL           Better Auth         Gemini / Groq
     studyhub_db        (email + password)      (AI providers)
```

### StudyHub AI layer

```
StudyHub AI
├── English Coach        (speaking, writing, listening, vocabulary)
├── AI Mentor            (admission, interview, strategy)
├── Technical Mentor     (Embedded, IoT, Robotics, C/C++)
└── Personal Context  →  Daily Plan  →  Recommendations
         ↑
   Learning Engine (state, priorities, diagnostic)
```

All API calls go through the Express backend. The Next.js app proxies `/api/*` to the backend so session cookies work on the same origin (`localhost:3000`).

---

# ⚙ Technology Stack

| Layer     | Tech                                            |
|-----------|-------------------------------------------------|
| Monorepo  | npm workspaces (`frontend` + `backend`)       |
| Frontend  | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend   | Node.js ≥ 18 (ESM), Express 4                   |
| Auth      | Better Auth (email + password, HttpOnly cookie) |
| Database  | PostgreSQL 17 (`studyhub_db`), driver `pg`      |
| AI        | Google Gemini + Groq (auto fallback)            |
| Uploads   | Multer → local `uploads/` directory             |
| i18n      | Custom FR/EN dictionary                         |
| Deploy    | Frontend: Vercel · Backend: Render · DB: Render |

> **Note:** The backend is plain Node.js ESM — there is **no TypeScript build step** and **no ORM**. SQL schemas are applied directly with `psql`.

---

# 📁 Repository Structure

```
studyhub/
├── README.md
├── .env.example                  # Shared env template (root)
├── package.json                  # npm workspaces + dev:all script
├── scripts/dev-all.mjs           # Starts backend + frontend together
├── database/
│   ├── schema.sql                # Business tables (13 tables)
│   └── migrations/               # Incremental SQL migrations
├── docs/
│   └── 01-product-vision.md
├── backend/
│   ├── server.js                 # Express entry point
│   └── src/
│       ├── config/               # env, database, auth, auth-schema.sql
│       ├── middleware/auth.js    # requireAuth helpers
│       ├── routes/               # 16 API route modules
│       └── services/learning/    # Learning Engine + diagnostic
└── frontend/
    ├── app/
    │   ├── (auth)/login/         # Login / sign-up
    │   ├── dashboard/            # 12 dashboard modules
    │   ├── layout.tsx
    │   └── page.tsx              # Landing page
    ├── components/
    ├── lib/                      # api.ts, auth-client.ts, i18n
    ├── middleware.ts             # Route protection
    └── next.config.js            # API proxy rewrites
```

---

# 🚀 Getting Started

## 1. Prerequisites

- Node.js ≥ 18
- PostgreSQL 17 (database `studyhub_db`)
- Root `.env` file (copy from `.env.example`)

## 2. Environment

Create `.env` at the project root:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/studyhub_db"
BETTER_AUTH_SECRET="<64-char-random-string>"
BETTER_AUTH_URL="http://localhost:8000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:8000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
PORT=8000
NODE_ENV="development"

# AI (optional but required for AI features)
GEMINI_API_KEY="your_gemini_key"
GEMINI_MODEL="gemini-2.0-flash"
GROQ_API_KEY="your_groq_key"
GROQ_MODEL="llama-3.3-70b-versatile"
```

Generate a secret:

```bash
openssl rand -base64 32
```

## 3. Database

Uses `DATABASE_URL` from your root `.env` automatically:

```bash
# Full schema + all migrations
npm run db:migrate

# Single migration (e.g. adaptive curriculum table)
npm run db:migrate:learning
```

Manual equivalent:

```bash
psql "$DATABASE_URL" -f backend/src/config/auth-schema.sql
psql "$DATABASE_URL" -f database/schema.sql
```

## 4. Install & run

From the project root:

```bash
npm install
npm run dev:all          # backend :8000 + frontend :3000
```

Or run separately:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Open `http://localhost:3000` — landing page or `/login` to sign in.

---

# 🧩 Dashboard Modules

| Module | Route | Status |
|--------|-------|--------|
| Dashboard | `/dashboard` | ✅ |
| Goal Tracker | `/dashboard/goals` | ✅ |
| Universities | `/dashboard/universities` | ✅ |
| Scholarships | `/dashboard/scholarships` | ✅ |
| Documents | `/dashboard/documents` | ✅ |
| English Coach | `/dashboard/english-coach` | ✅ |
| English Diagnostic | `/dashboard/english-diagnostic` | ✅ |
| Technical Diagnostic | `/dashboard/technical-diagnostic` | ✅ |
| Adaptive Curriculum | `/dashboard/curriculum` | ✅ |
| AI Mentor | `/dashboard/ai-mentor` | ✅ |
| Technical Learning | `/dashboard/technical-learning` | ✅ |
| Planner | `/dashboard/planner` | ✅ |
| Resources | `/dashboard/resources` | ✅ |
| Analytics | `/dashboard/analytics` | ✅ |

---

# 🔌 API Reference

All business routes require a valid `better-auth.session_token` cookie and are scoped per `user_id`.

## Auth (Better Auth)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/sign-up/email` | Register |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/get-session` | Current session |

## Core modules

| Prefix | Description |
|--------|-------------|
| `/api/goals` | CRUD goals |
| `/api/universities` | CRUD universities |
| `/api/documents` | CRUD documents + file upload |
| `/api/scholarships` | CRUD scholarships + AI search |
| `/api/planner` | Daily tasks |
| `/api/resources` | Resource library |
| `/api/flashcards` | Vocabulary flashcards |
| `/api/technical` | Technical progress tracking |
| `/api/profile` | Student profile (no fake defaults) |

## AI

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/ask` | Chat with context-aware AI |
| POST | `/api/ai/recommendations` | Personalized recommendations |
| POST | `/api/ai/daily-plan` | Generate daily plan |
| POST | `/api/ai/daily-plan/action` | Mark action completed/dismissed |
| GET | `/api/ai/daily-plan/progress` | Today's plan progress |
| GET/POST/DELETE | `/api/chat-messages` | Conversation history |

## Adaptive Learning Engine

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/learning/state` | Full learning state |
| GET | `/api/learning/priorities` | Personalized priority actions |
| GET | `/api/learning/summary` | Progress summary |
| GET | `/api/learning/diagnostic/english/questions` | Diagnostic questions |
| POST | `/api/learning/diagnostic/english/submit` | Submit answers |
| GET | `/api/learning/diagnostic/english/latest` | Latest assessment |
| GET | `/api/learning/diagnostic/technical/tracks` | Available technical tracks |
| GET | `/api/learning/diagnostic/technical/questions?track=` | Technical questions |
| POST | `/api/learning/diagnostic/technical/submit` | Submit technical answers |
| GET | `/api/learning/diagnostic/technical/latest?track=` | Latest technical assessment |
| GET | `/api/learning/curriculum` | Active curriculum + focus areas |
| POST | `/api/learning/curriculum/generate` | Generate exercises from weaknesses |
| PATCH | `/api/learning/curriculum/:id` | Complete or skip an exercise |

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server + database health check |

---

# 🗄️ Database Tables

```
user (Better Auth)
 ├── user_profiles
 ├── goals
 ├── universities
 ├── documents
 ├── scholarships
 ├── planner_tasks
 ├── resources
 ├── flashcards
 ├── technical_progress
 ├── gemini_chat_messages
 ├── ai_action_events
 └── learning_assessments
```

---

# 🛣 Roadmap

| Area | Status | Notes |
|------|--------|-------|
| Auth + PostgreSQL | ✅ Done | Better Auth + pg |
| Core CRUD modules | ✅ Done | Goals, universities, documents, … |
| AI Mentor + Coach | ✅ Done | Gemini/Groq, context, memory |
| Daily Plan + tracking | ✅ Done | `ai_action_events` |
| Learning Engine | ✅ Done | State, priorities, summary |
| English Diagnostic | ✅ Done | Persistent assessments |
| Technical Diagnostic | ✅ Done | Skill-based Embedded + AI tracks |
| Adaptive Curriculum | ✅ Done | Template + AI exercises from weaknesses |
| Scholarship ingestion | ⏳ Planned | Official sources, not LLM-only |
| Automated tests | ⏳ Planned | — |
| Cloud file storage | ⏳ Planned | Supabase or equivalent |

---

# 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE).

---

<div align="center">

### 🚀 One Platform. One Goal. Your Future.

</div>
