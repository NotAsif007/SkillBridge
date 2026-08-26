# CareerOS Architecture & Repository Guide

## 1. Monorepo Directory Architecture

```text
CareerOS
│
├── apps/
│   │
│   ├── backend/                 ← Person 1 (branch: backend/core)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/      (auth, role, orgScope, correlation, error, upload)
│   │   │   ├── validators/
│   │   │   ├── utils/           (logger, response envelopes, regex sanitizers)
│   │   │   └── integrations/    (gemini, google)
│   │   │
│   │   └── tests/               (15 Jest test suites, 93 tests)
│   │
│   └── frontend/                ← React 18 + Vite (port 5173)
│       │
│       └── src/
│           │
│           ├── app/             ← Shared (router, App providers)
│           ├── api/             ← Shared (Axios client with base config)
│           ├── components/      ← Shared UI primitives & AppShell
│           │   ├── common/      (AppShell.jsx - centralized responsive shell)
│           │   ├── ui/          (buttons, cards, badges, dialogs)
│           │   └── charts/      (readiness gauge, bar charts, distributions)
│           ├── layouts/         ← Shared (StudentLayout, AdminLayout wrapping AppShell)
│           │
│           └── features/
│               │
│               ├── student/     ← Person 2 (branch: frontend/student)
│               │   ├── dashboard/
│               │   ├── profile/
│               │   ├── careers/
│               │   ├── assessments/
│               │   ├── roadmap/
│               │   ├── projects/
│               │   ├── resume/
│               │   ├── interview/
│               │   └── jobs/
│               │
│               └── admin/       ← Person 3 (branch: frontend/admin)
│                   ├── dashboard/
│                   ├── students/
│                   ├── departments/
│                   ├── analytics/
│                   ├── assessments/
│                   ├── interviews/
│                   └── jobs/
│
├── docs/
│   ├── openapi.yaml
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── DESIGN.md
├── CONTEXT.md                   ← Continuation context & handoff log
├── SPEC.md
└── README.md
```

---

## 2. Layer & Domain Responsibilities

### Backend Layer (`apps/backend/` — Person 1)
```text
HTTP Request
  ↓
Middleware Stack:
  ├── Correlation (Attaches/propagates X-Request-ID, exposes CORS)
  ├── Logger (Structured logging with duration and redacted secrets)
  ├── Rate Limiter & Security Headers (Helmet, CORS)
  ├── Authentication (requireAuth, JWT verification)
  ├── Authorization (requireRole: STUDENT / COLLEGE_ADMIN / SUPER_ADMIN)
  └── Organization Scope (enforces tenant boundaries)
  ↓
Validator (validators/ - Zod schemas)
  ↓
Controller (controllers/ - Thin orchestration & status codes)
  ↓
Service (services/ - Domain logic, deterministic scoring, weight normalization)
  ↓
Mongoose Model (models/) + Gemini AI (integrations/gemini/)
  ↓
MongoDB Database
```

### Student Frontend (`apps/frontend/src/features/student/` — Person 2)
| Subfolder | Feature Purpose | Primary API Endpoints Consumed |
| :--- | :--- | :--- |
| `dashboard/` | Student overview & readiness cards | `GET /api/v1/dashboard/student` |
| `profile/` | Academic info & skill management | `GET /api/v1/profile`, `PUT /api/v1/profile`, `POST /api/v1/profile/skills`, `PUT /api/v1/profile/target-career` |
| `careers/` | Career exploration & target selection | `GET /api/v1/careers`, `PUT /api/v1/profile/target-career` |
| `assessments/` | Taking tests & viewing scores | `GET /api/v1/assessments`, `POST /api/v1/assessments/:id/submit` |
| `roadmap/` | Personalized milestone task tracker | `GET /api/v1/roadmaps/me`, `PUT /api/v1/roadmaps/tasks/:id/toggle` |
| `projects/` | Student portfolio project showcases | `GET /api/v1/projects`, `POST /api/v1/projects` |
| `resume/` | PDF upload & AI ATS diagnostic | `POST /api/v1/resumes/upload` |
| `interview/` | Interactive AI mock interview | `POST /api/v1/interviews`, `POST /api/v1/interviews/:id/answer` |
| `jobs/` | Job discovery with skill matching & eligibility | `GET /api/v1/jobs`, `POST /api/v1/jobs/:id/apply` |

### Admin Frontend (`apps/frontend/src/features/admin/` — Person 3)
| Subfolder | Feature Purpose | Primary API Endpoints Consumed |
| :--- | :--- | :--- |
| `dashboard/` | College placement summary | `GET /api/v1/dashboard/admin` |
| `students/` | Student search, filter & tracking | `GET /api/v1/admin/students` |
| `departments/` | Departmental performance | `GET /api/v1/admin/departments` |
| `analytics/` | Readiness & skill distributions | `GET /api/v1/admin/analytics` |
| `assessments/` | Assessment score analytics | `GET /api/v1/admin/assessments/analytics` |
| `interviews/` | AI interview performance reports | `GET /api/v1/admin/interviews/analytics` |
| `jobs/` | Campus drives & placement matches | `GET /api/v1/admin/jobs` |

---

## 3. Multi-Tenant Organization Isolation

- **Zero-Trust Client Input**: Never accept `organizationId` from frontend request body or query parameter for authorization decisions.
- **Server Injection**: Authenticated user's verified `organizationId` from session/JWT is attached to `req.user.organizationId`.
- **Query Scoping**: Database queries for organization-scoped collections are automatically enclosed in `{ organizationId: req.user.organizationId }`.

---

## 4. Observability & Lifecycle Architecture

- **Correlation (`X-Request-ID`)**: Unique identifier per request, returned in response header, exposed via CORS, and logged across all service calls.
- **Structured Redacting Logger**: Logs HTTP method, URL, status, latency ms, and actor context while automatically stripping sensitive keys (`password`, `token`, `secret`, `authorization`, `cookie`, `apiKey`).
- **Guarded Graceful Shutdown**: Intercepts `SIGINT`, `SIGTERM`, unhandled promise rejections, and uncaught exceptions to safely close the HTTP listener and disconnect MongoDB connections within a 10-second safety timeout.

---

## 5. Protected Shared Files
- `SPEC.md`
- `README.md`
- `CONTEXT.md`
- `docs/openapi.yaml`
- `docs/API_CONTRACT.md`
- `docs/DESIGN.md`
- `apps/frontend/src/app/router.jsx`
- `apps/frontend/src/api/client.js`
- `apps/frontend/src/components/common/AppShell.jsx`
