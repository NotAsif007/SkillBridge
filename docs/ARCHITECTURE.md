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
│   │   │   ├── middleware/
│   │   │   ├── validators/
│   │   │   └── integrations/
│   │   │
│   │   └── tests/
│   │
│   └── frontend/
│       │
│       └── src/
│           │
│           ├── app/             ← Shared
│           ├── api/             ← Shared
│           ├── components/      ← Shared
│           ├── layouts/         ← Shared
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
├── SPEC.md
└── README.md
```

---

## 2. Layer & Domain Responsibilities

### Backend Layer (`apps/backend/` — Person 1)
```text
Route (routes/)
  ↓
Middleware (middleware/ - requireAuth, requireRole, orgScope)
  ↓
Validator (validators/ - Zod schemas)
  ↓
Controller (controllers/ - Thin orchestration)
  ↓
Service (services/ - Domain logic & Deterministic scoring)
  ↓
Mongoose Model (models/) + Gemini AI (integrations/gemini/)
  ↓
MongoDB Database
```

### Student Frontend (`apps/frontend/src/features/student/` — Person 2)
| Subfolder | Feature Purpose | Primary API Endpoints Consumed |
| :--- | :--- | :--- |
| `dashboard/` | Student overview & readiness cards | `GET /api/v1/dashboard/student` |
| `profile/` | Academic info & skill management | `GET /api/v1/profile`, `PUT /api/v1/profile`, `POST /api/v1/profile/skills` |
| `careers/` | Career exploration & target selection | `GET /api/v1/careers`, `PUT /api/v1/profile/target-career` |
| `assessments/` | Taking tests & viewing scores | `GET /api/v1/assessments`, `POST /api/v1/assessments/:id/submit` |
| `roadmap/` | Personalized milestone task tracker | `GET /api/v1/roadmaps/me`, `PUT /api/v1/roadmaps/tasks/:id/toggle` |
| `projects/` | Student portfolio project showcases | `GET /api/v1/projects`, `POST /api/v1/projects` |
| `resume/` | PDF upload & AI ATS diagnostic | `POST /api/v1/resumes/upload` |
| `interview/` | Interactive AI mock interview | `POST /api/v1/interviews`, `POST /api/v1/interviews/:id/answer` |
| `jobs/` | Job discovery with skill matching | `GET /api/v1/jobs`, `POST /api/v1/jobs/:id/apply` |

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

## 4. Protected Shared Files
- `SPEC.md`
- `README.md`
- `docs/openapi.yaml`
- `docs/API_CONTRACT.md`
- `docs/DESIGN.md`
- `apps/frontend/src/app/router.jsx`
- `apps/frontend/src/api/client.js`
