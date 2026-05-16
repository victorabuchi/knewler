<div align="center">
  <img src="https://raw.githubusercontent.com/victorabuchi/knewler/main/knewler-frontend/public/knewler-favicon.svg" width="64" alt="Knewler" />
  <h1>Knewler</h1>
  <p>Multi-tenant eLearning platform. From knowing to mastering.</p>
  <p>
    <a href="https://knewler.com">knewler.com</a> &nbsp;·&nbsp;
    <a href="https://api.knewler.com">api.knewler.com</a>
  </p>
</div>

---

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Overview

Knewler is a multi-tenant eLearning platform that lets any institution — university, corporate team, sports club, or school — spin up a fully isolated learning environment in seconds. Each tenant gets their own courses, students, exams, certificates, and custom domain. Admins manage everything through a clean dashboard; students log in and take courses and exams scoped entirely to their institution.

---

## How it works

```
Institution signs up
        │
        ▼
Instant environment created
(isolated tenant, admin account)
        │
        ▼
Add courses · enroll students
schedule sessions · build exams
        │
        ▼
Add custom domain
(CNAME → cname.knewler.com)
        │
        ▼
Go live
```

---

## Features

| Area | What's included |
|---|---|
| **Multi-tenant onboarding** | Institution registration with slug, type, and plan; JWT-scoped sessions per tenant |
| **LMS Core** | Courses with cover colours, status (draft / published / archived), teacher assignment |
| **Student Registry** | Add students / teachers / admins; avatar initials; active/inactive status; client-side search |
| **Scheduling** | Timetable sessions linked to courses; recurrence (none / daily / weekly); location field |
| **Exam Engine** | Timed exams with pass score, question bank (MCQ / essay / true–false / file upload), shuffle, tab-lock anti-cheat |
| **Certificates** | Auto-issued on course completion; verifiable via unique code; manual issuance endpoint |
| **Settings & Domain** | General settings (name, type); custom domain with live CNAME DNS verification; billing plan display |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router · TypeScript · inline styles |
| Backend | Node.js 20 · Fastify 5 |
| Database | PostgreSQL via Supabase |
| Auth | JWT (`@fastify/jwt`) · `tokenRef` pattern (no re-render on token read) |
| Deployment | Render (separate services for frontend and backend) |
| Domain | Namecheap → `knewler.com` |

---

## Project structure

```
knewler/
├── knewler-backend/
│   ├── src/
│   │   ├── app.js                  # Fastify server, plugin registration, route mounting
│   │   ├── db/
│   │   │   ├── index.js            # pg Pool singleton
│   │   │   ├── migrate.js          # runs schema.sql against the database
│   │   │   ├── schema.sql          # all 11 tables
│   │   │   └── test-connection.js
│   │   └── routes/
│   │       ├── auth.js             # register, login, /me
│   │       ├── courses.js          # CRUD courses
│   │       ├── students.js         # CRUD users within a tenant
│   │       ├── schedule.js         # timetable sessions
│   │       ├── exams.js            # exams + question bank
│   │       ├── certificates.js     # issue + list certificates
│   │       └── settings.js         # tenant settings + CNAME verify
│   ├── .env
│   └── package.json
│
└── knewler-frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                # marketing / landing redirect
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── onboarding/page.tsx
    │   └── dashboard/
    │       ├── layout.tsx          # auth guard + TopNav
    │       ├── page.tsx            # overview + quick actions
    │       ├── courses/
    │       │   ├── page.tsx        # 3-column card grid
    │       │   └── create/page.tsx
    │       ├── students/
    │       │   ├── page.tsx        # table + client-side search
    │       │   └── new/page.tsx
    │       ├── schedule/
    │       │   ├── page.tsx        # session list with left accent
    │       │   └── new/page.tsx
    │       ├── exams/
    │       │   ├── page.tsx        # 3-column card grid
    │       │   ├── create/page.tsx
    │       │   └── [id]/page.tsx   # question bank + inline add-question form
    │       ├── certificates/page.tsx
    │       └── settings/page.tsx   # tabbed: general · domain · billing
    ├── components/layout/
    │   ├── TopNav.tsx              # sticky nav, role badge, sign-out
    │   └── Sidebar.tsx
    ├── lib/
    │   ├── api.ts                  # axios instance with auth interceptor
    │   └── auth.tsx                # AuthContext, tokenRef pattern
    ├── .env.local
    └── package.json
```

---

## Getting started

### 1. Clone

```bash
git clone https://github.com/victorabuchi/knewler.git
cd knewler
```

### 2. Backend

```bash
cd knewler-backend
npm install
```

Create `.env`:

```env
PORT=3005
FRONTEND_URL=http://localhost:3004
JWT_SECRET=knewler_dev_secret_change_in_production
DATABASE_URL=postgresql://user:password@host:5432/postgres
```

Run the migration then start:

```bash
node src/db/migrate.js
node src/app.js
# API running at http://localhost:3005
```

### 3. Frontend

```bash
cd knewler-frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3005
```

```bash
npm run dev
# UI running at http://localhost:3004
```

---

## Environment variables

### Backend (`knewler-backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the Fastify server listens on (default `3005`) |
| `FRONTEND_URL` | Allowed CORS origin |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |

### Frontend (`knewler-frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

---

## API reference

All protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create tenant + admin user, returns JWT |
| `POST` | `/api/auth/login` | Login with email + password + slug, returns JWT |
| `GET` | `/api/auth/me` | Return current user and tenant |

### Courses

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/courses` | List all courses for tenant (with teacher name + student count) |
| `POST` | `/api/courses` | Create a course |

### Students

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/students` | List all users for tenant |
| `POST` | `/api/students` | Create a user (bcrypt password, tenant-scoped) |

### Schedule

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/schedule` | List sessions ordered by `starts_at` ASC |
| `POST` | `/api/schedule` | Create a session (validates end > start) |

### Exams

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/exams` | List exams with course title + question count |
| `POST` | `/api/exams` | Create an exam |
| `GET` | `/api/exams/:id` | Get single exam |
| `GET` | `/api/exams/:id/questions` | List questions for an exam |
| `POST` | `/api/exams/:id/questions` | Add a question (MCQ options stored as JSONB) |

### Certificates

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/certificates` | List all certificates for tenant |
| `POST` | `/api/certificates` | Manually issue a certificate |

### Settings

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/settings` | Return full tenant record |
| `PUT` | `/api/settings/general` | Update institution name and type |
| `POST` | `/api/settings/domain` | Save custom domain (resets verified flag) |
| `POST` | `/api/settings/domain/verify` | DNS CNAME check → update `domain_verified` |

---

## Deployment (Render)

Two services, both on Render free tier.

### Backend

| Setting | Value |
|---|---|
| Root directory | `knewler-backend` |
| Build command | `npm install` |
| Start command | `node src/app.js` |
| Environment | Add all variables from the backend `.env` table |

### Frontend

| Setting | Value |
|---|---|
| Root directory | `knewler-frontend` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Environment | `NEXT_PUBLIC_API_URL=https://api.knewler.com` |

---

## Engineering notes

**`tokenRef` pattern** — The auth token is stored in a `useRef` inside `AuthProvider` rather than `useState`. This means reading the token for API calls never triggers a re-render. The stored `knewler_token` in `localStorage` is the persistence layer; `tokenRef` is the in-memory fast path.

**Multi-tenant middleware** — Every protected route reads `tenant_id` from the verified JWT payload (`request.user.tenant_id`). No route trusts a tenant ID from the request body or query string for scoping. This makes cross-tenant data leakage impossible at the query level.

**CNAME DNS verification** — The `/api/settings/domain/verify` route uses Node's built-in `dns.promises.resolveCname()` — no external dependency. It normalises trailing dots in CNAME responses before comparing to `cname.knewler.com`. A failed lookup (NXDOMAIN, SERVFAIL) is caught and treated as `verified = false`, never as a 500.

**JWT tenant isolation** — The JWT payload carries `{ id, email, role, tenant_id }`. The `authenticate` decorator verifies the signature before any route handler runs. All SQL queries include `WHERE tenant_id = $N` as a hard filter, so even a valid token from tenant A cannot reach tenant B's data.

**`useSearchParams` + Suspense** — The Settings page splits its content into `SettingsContent` (which calls `useSearchParams`) wrapped in `<Suspense>` exported from `SettingsPage`. This satisfies Next.js 16's requirement that `useSearchParams` be inside a Suspense boundary to avoid build failures on statically rendered routes.

---

## Database schema

11 tables, all scoped by `tenant_id` (UUID foreign key to `tenants`):

| Table | Purpose |
|---|---|
| `tenants` | One row per institution — name, slug, plan, domain |
| `users` | Every person in a tenant — role, password hash, active flag |
| `courses` | Learning content — title, description, status, teacher |
| `modules` | Lessons inside a course — type, content JSONB, position |
| `enrollments` | Student ↔ course membership, progress tracking |
| `schedules` | Timetable sessions — location, recurrence, start/end times |
| `exams` | Assessments — duration, pass score, shuffle, tab-lock |
| `questions` | Individual exam questions — type, body, options JSONB, points |
| `exam_attempts` | Student submissions — answers JSONB, score, pass/fail |
| `certificates` | Issued completions — verify code, cert URL |
| `subscriptions` | Billing per tenant — Stripe IDs, plan, status |

---

## Roadmap

- [x] Multi-tenant registration and login
- [x] Dashboard with overview stats
- [x] Courses — create, list, status management
- [x] Students — add, list, search, role management
- [x] Schedule — sessions with recurrence
- [x] Exams — question bank, MCQ with options, anti-cheat settings
- [x] Certificates — issue and verify
- [x] Settings — general, custom domain with DNS verification, billing plans
- [ ] Course modules (video, PDF, text lessons)
- [ ] Student exam-taking interface with tab-lock enforcement
- [ ] Automatic certificate issuance on course completion
- [ ] Stripe billing integration
- [ ] Email notifications (enrollment, exam results, certificates)
- [ ] Student portal (separate login flow)
- [ ] Analytics dashboard (completion rates, exam scores)
- [ ] SSO / SCIM for enterprise tenants

---

## License

MIT © [Victor Abuchi](https://github.com/victorabuchi)
