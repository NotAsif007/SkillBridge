# CareerOS

> AI-Powered Career & Placement Readiness Operating System for Colleges and Students.

---

## 🏗️ Repository Architecture & Ownership

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

## 👥 Three-Person Parallel Development Model

| Person | Role | Git Branch | Owned Directory | Key Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Person 1** | Backend & Core Platform | `backend/core` | `apps/backend/`, `docs/openapi.yaml`, `docs/API_CONTRACT.md`, `docs/DATABASE.md` | Express APIs, Mongoose, Auth, Career Gap Engine, Gemini AI, Tests |
| **Person 2** | Student Experience | `frontend/student` | `apps/frontend/src/features/student/` | Student dashboard, career analysis, assessments, roadmap, projects, AI interview |
| **Person 3** | Admin & Analytics Frontend | `frontend/admin` | `apps/frontend/src/features/admin/` | College placement dashboard, student tracking, department analytics, reports |

---

## 🚀 Quickstart

### Prerequisites
- Node.js >= 18.x
- MongoDB (Local or Atlas)
- Google Cloud OAuth Credentials
- Google Gemini API Key

### Backend Setup (Person 1)
```bash
cd apps/backend
cp .env.example .env
npm install
npm run dev
```

### Frontend Setup (Person 2 & 3)
```bash
cd apps/frontend
npm install
npm run dev
```

---

## 📚 Essential Documentation
- **[SPEC.md](SPEC.md)**: Master product specification & requirements
- **[docs/API_CONTRACT.md](docs/API_CONTRACT.md)**: REST API contracts & mock data
- **[docs/DESIGN.md](docs/DESIGN.md)**: Design system tokens & UI/UX guidelines
- **[docs/DATABASE.md](docs/DATABASE.md)**: MongoDB schemas & indexes
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture & multi-tenant isolation
- **[docs/openapi.yaml](docs/openapi.yaml)**: OpenAPI 3.0 specification
