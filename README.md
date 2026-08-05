<div align="center">

# 🎓 StudyHub

### Your AI-Powered Companion for International Studies

[![License: MIT](https://img.shields.io/badge/License-MIT-2ea44f.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Active-blue.svg)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-43853d?logo=node.js)
![Database](https://img.shields.io/badge/Database-PostgreSQL-316192?logo=postgresql)
![Auth](https://img.shields.io/badge/Auth-Better%20Auth-FF6B6B)

**AI • Education • Productivity • Scholarships • English Learning**

</div>

---

# 📖 Overview

StudyHub is an AI-powered web platform designed to help students prepare for international studies.
Instead of using multiple applications to organize documents, improve English, track scholarships and manage university applications, StudyHub brings everything together into a single intelligent workspace.

---

# 🏗 Architecture

```
                        StudyHub Platform

                     ┌────────────────────┐
                     │   Next.js App      │   Frontend (UI, auth client, dashboard)
                     │   (port 3000)      │
                     └─────────┬──────────┘
                               │  REST API + HttpOnly cookie
                               │  /api/auth/*  /api/goals/*  /api/universities/*  /api/documents/*
                     ┌─────────▼──────────┐
                     │   Node.js API      │   Backend (Express, ESM, no build step)
                     │   (port 8000)      │
                     └─────────┬──────────┘
                               │
            ┌──────────────────┼───────────────────┐
            ▼                  ▼                    ▼
     PostgreSQL           Better Auth            File Storage
     studyhub_db        (email + password)      (future integration)
```

---

# ⚙ Technology Stack

| Layer     | Tech                                            |
|-----------|-------------------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind  |
| Backend   | Node.js (ESM), Express 4                        |
| Auth      | Better Auth (email + password)                  |
| Database  | PostgreSQL 17 (`studyhub_db`)                   |
| DB driver | `pg`                                            |
| Storage   | Supabase Storage (planned)                      |
| AI        | Gemini / Groq (planned)                         |
| Deploy    | Frontend: Vercel · Backend: Render · DB: Render |

> **Note:** The backend is plain Node.js ESM — there is **no TypeScript build step**. You run it directly with `node server.js`.

---

# 📁 Repository Structure

```
studyhub/
├── README.md                      # This file
├── .env                          # Shared secrets (root) — DATABASE_URL, BETTER_AUTH_SECRET, ...
├── .env.example                  # Template
├── database/
│   └── schema.sql                # Business tables (goals, universities, documents)
├── backend/
│   ├── server.js                 # Entry point (Express app)
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── config/
│       │   ├── env.js            # Loads + exposes env vars (root .env)
│       │   ├── database.js       # pg Pool + health check
│       │   ├── auth.js           # Better Auth instance
│       │   └── auth-schema.sql   # Better Auth SQL (apply to DB)
│       ├── middleware/
│       │   └── auth.js           # requireAuth + getSessionUser helpers
│       └── routes/
│           ├── auth.js           # Better Auth handler (/api/auth/*)
│           ├── goals.js          # /api/goals (protected)
│           ├── universities.js   # /api/universities (protected)
│           └── documents.js      # /api/documents (protected)
└── frontend/
    ├── app/
    │   ├── (auth)/login/         # Login / sign-up page
    │   ├── (dashboard)/          # Goals, Universities, Documents, Planner...
    │   ├── login/                # (kept for redirect compatibility)
    │   ├── layout.tsx
    │   └── page.tsx              # redirects to /login
    ├── components/
    │   ├── auth/LoginForm.tsx
    │   └── dashboard/DashboardClient.tsx
    ├── lib/auth-client.ts        # Fetch wrapper for Better Auth endpoints
    └── middleware.ts             # Route protection via session cookie
```

---

# 🚀 Getting Started

## 1. Prerequisites

- Node.js >= 18
- PostgreSQL 17 (a `studyhub_db` database)
- The root `.env` file (copy from `.env.example`)

## 2. Environment

Root `.env` (shared by backend and frontend):

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/studyhub_db?schema=public"
BETTER_AUTH_SECRET="<64-char-random-string>"
BETTER_AUTH_URL="http://localhost:8000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:8000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
PORT=8000
NODE_ENV="development"
```

Generate a secret with:

```bash
openssl rand -base64 32
```

## 3. Database

```bash
# Better Auth tables (user, session, account, verification)
psql -d studyhub_db -f backend/src/config/auth-schema.sql

# Business tables (goals, universities, documents)
psql -d studyhub_db -f database/schema.sql
```

## 4. Backend

```bash
cd backend
npm install
npm run dev          # or: npm start  (node server.js)
```

Listens on `http://localhost:8000`.

## 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` — you are redirected to `/login`.

---

# 🔌 API Reference

All business routes require a valid `better-auth.session_token` cookie and are scoped per `user_id`.

## Auth (Better Auth)

| Method | Path                          | Description              |
|--------|-------------------------------|--------------------------|
| POST   | `/api/auth/sign-up/email`     | Register with email      |
| POST   | `/api/auth/sign-in/email`     | Login with email         |
| POST   | `/api/auth/sign-out`          | Logout                   |
| GET    | `/api/auth/get-session`       | Current session          |

## Goals

| Method | Path             | Description            |
|--------|------------------|------------------------|
| GET    | `/api/goals`     | List user's goals      |
| POST   | `/api/goals`     | Create a goal          |
| PATCH  | `/api/goals/:id` | Update (progress, ...) |
| DELETE | `/api/goals/:id` | Delete a goal          |

## Universities

| Method | Path                  | Description            |
|--------|-----------------------|------------------------|
| GET    | `/api/universities`   | List tracked unis      |
| POST   | `/api/universities`   | Add a university       |

## Documents

| Method | Path               | Description            |
|--------|--------------------|------------------------|
| GET    | `/api/documents`   | List user's documents  |
| POST   | `/api/documents`   | Add a document record  |

---

# 🧩 Modules (Roadmap)

| Phase | Module                        | Status        |
|-------|-------------------------------|---------------|
| 1     | Authentication                | ✅ Done       |
| 1     | Dashboard                     | ✅ Done       |
| 1     | Goal Tracker                  | 🟡 In progress|
| 1     | Document Manager              | 🟡 In progress|
| 2     | Universities & Scholarships   | 🟡 In progress|
| 2     | Planner                       | ⏳ Planned    |
| 3     | AI English Coach              | ⏳ Planned    |
| 3     | AI Mentor                     | ⏳ Planned    |
| 4     | Technical Learning            | ⏳ Planned    |
| 4     | Analytics                     | ⏳ Planned    |

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### 🚀 One Platform. One Goal. Your Future.

</div>
