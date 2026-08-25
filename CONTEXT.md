# CareerOS — Development Context File

> ⚠️ IMPORTANT: Read this file first whenever switching IDEs or resuming work.
> Update this file after every phase completes.

---

## Current Status

- **Active Branch**: `backend/core`
- **Active Developer**: Person 1 (Backend & AI)
- **Status**: ALL BACKEND PHASES (0–14) COMPLETED & 100% TESTED
- **Total Passing Tests**: 79 across 14 Test Suites
- **Last Updated**: 2026-08-25

---

## Completed Phases Summary

### ✅ Phase 0 — Repository Foundation & Contracts
- Monorepo structure, Git branches (`main`, `develop`, `backend/core`)
- Complete docs: `SPEC.md`, `docs/API_CONTRACT.md`, `docs/openapi.yaml`, `docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`
- Scaffolded folder tree across backend and frontend workspaces

### ✅ Phase 1 — Backend Foundation
- Express server, MongoDB connection manager (`src/config/db.js`)
- Security middleware (Helmet, CORS, Rate Limiters)
- Centralized Error Handling & AppError (`src/utils/errors.js`)
- Response envelope standard (`src/utils/responseEnvelope.js`)
- Zod Request Validator middleware (`src/middleware/validate.middleware.js`)
- Health Check (`GET /api/v1/health`)

### ✅ Phase 2 — Authentication & Multi-Tenancy
- Models: `User`, `Organization`, `Department`
- Google OAuth / OpenID Connect token verification (`src/integrations/google/oauthClient.js`)
- JWT session issuance & verification (`src/services/auth.service.js`)
- Role & Organization access control (`src/middleware/auth.middleware.js`, `role.middleware.js`, `organizationScope.middleware.js`)
- Endpoints: `POST /api/v1/auth/google`, `POST /api/v1/auth/dev-login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`

### ✅ Phase 3 — Profiles & Organizations
- `StudentProfile` Model with multi-tenant scoping
- Profile Service with auto-initialization (`src/services/profile.service.js`)
- Endpoints: `GET /api/v1/profile`, `PUT /api/v1/profile`, `POST /api/v1/profile/skills`, `PUT /api/v1/profile/target-career`

### ✅ Phase 4 — Careers & Skills + Database Seed
- Models: `Skill`, `Career`, `CareerRequirement`
- Career and Skill Services & Controllers
- Comprehensive Seed Script (`scripts/seed.js` with Apex Institute, 4 depts, 37 skills, 6 careers with weighted requirements)
- Endpoints: `GET /api/v1/careers`, `GET /api/v1/careers/:id`, `GET /api/v1/skills`

### ✅ Phase 5 — Skill Assessments & Anti-Leak Evaluation
- Models: `Assessment`, `AssessmentAttempt`
- Question sanitization (stripping answers during attempt), automated grading, proficiency upgrade on pass
- Endpoints: `GET /api/v1/assessments`, `GET /api/v1/assessments/:id`, `POST /api/v1/assessments/:id/submit`, `GET /api/v1/assessments/attempts/me`

### ✅ Phase 6 — Deterministic Career Gap Engine
- Deterministic weighted scoring algorithm evaluating student skills against career requirements
- Dynamic categorization of `matchedSkills`, `weakSkills`, and `missingSkills`
- Gap-weighted priority ranking: `weight * (gap + 1)`
- Institutional weight customization (`technicalSkills` 30%, `assessments` 20%, `projects` 15%, `resume` 10%, `interviews` 15%, `roadmap` 10%)
- Endpoint: `GET /api/v1/career-analysis` (supports `?careerId=...`)

### ✅ Phase 7 — Gemini AI Integration
- `AIGeneration` Model for token audit logs
- `GeminiClient` singleton and `GeminiService` structured JSON engine for career insights, roadmap plans, resume diagnostics, project recommendations, and interview critique with non-blocking fallbacks

### ✅ Phase 8 — Roadmaps
- `Roadmap` Model with milestones, task IDs, resource links, and progress percentages
- AI roadmap generation targeting identified skill gaps
- Endpoints: `GET /api/v1/roadmaps/active`, `GET /api/v1/roadmaps/me`, `POST /api/v1/roadmaps/generate`, `PATCH /api/v1/roadmaps/tasks/:taskId`, `PUT /api/v1/roadmaps/tasks/:taskId/toggle`

### ✅ Phase 9 — Projects
- `Project` Model for student portfolio items
- AI project recommendations closing target career gaps
- Deterministic project scoring algorithm synced to placement readiness
- Endpoints: `GET /api/v1/projects`, `POST /api/v1/projects`, `PUT /api/v1/projects/:id`, `DELETE /api/v1/projects/:id`, `GET /api/v1/projects/recommendations`

### ✅ Phase 10 — Resumes
- `Resume` Model storing ATS, formatting, and impact scores, extracted skills, and recommendations
- Resume parsing & ATS scoring via Gemini AI with placement readiness sync
- Endpoints: `POST /api/v1/resumes/analyze`, `POST /api/v1/resumes/upload`, `GET /api/v1/resumes/latest`, `GET /api/v1/resumes/history`

### ✅ Phase 11 — AI Mock Interviews
- `InterviewSession` Model storing multi-turn question flows, answers, and rubrics
- State machine generating next questions and scoring overall performance
- Endpoints: `POST /api/v1/interviews/start`, `POST /api/v1/interviews`, `POST /api/v1/interviews/:sessionId/answer`, `GET /api/v1/interviews/:sessionId`, `GET /api/v1/interviews/history`

### ✅ Phase 12 — Jobs & Applications
- `Job` and `JobApplication` Models with compound unique constraint
- Deterministic skill match percentage engine (`calculateJobMatch`)
- Endpoints: `GET /api/v1/jobs`, `GET /api/v1/jobs/:id`, `POST /api/v1/jobs/:id/apply`, `GET /api/v1/jobs/applications/me`, `POST /api/v1/jobs`

### ✅ Phase 13 — Student Dashboard Aggregation
- Single-round-trip composite query powering Person 2's Student Frontend
- Aggregates readiness score, skill progress, roadmap progress, projects, interviews, active job matches, target career, top skill gaps, and recent activity
- Endpoint: `GET /api/v1/dashboard/student`

### ✅ Phase 14 — College Admin Analytics & Management
- Single-round-trip composite query powering Person 3's Admin Frontend
- Aggregates total students, placement ready counts & percentages, average readiness, active jobs, department breakdown, institutional skill gaps, and score distributions
- Paginated student roster, department list, and placement conversion pipeline
- Endpoints: `GET /api/v1/dashboard/admin`, `GET /api/v1/admin/students`, `GET /api/v1/admin/departments`, `GET /api/v1/admin/analytics/placements`

---

## Complete API Surface Directory

| Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Public | System and DB health check |
| `POST` | `/api/v1/auth/google` | Public | Google OAuth login |
| `POST` | `/api/v1/auth/dev-login` | Public | Development login bypassing Google OAuth |
| `GET` | `/api/v1/auth/me` | Auth | Current user profile & identity |
| `POST` | `/api/v1/auth/logout` | Auth | End session |
| `GET` | `/api/v1/profile` | Auth | Get student profile |
| `PUT` | `/api/v1/profile` | Auth | Update profile details |
| `POST` | `/api/v1/profile/skills` | Auth | Add or update student skill level |
| `PUT` | `/api/v1/profile/target-career`| Auth | Set active target career |
| `GET` | `/api/v1/careers` | Auth | List all careers |
| `GET` | `/api/v1/careers/:id` | Auth | Get career with weighted requirements |
| `GET` | `/api/v1/skills` | Auth | List master skills |
| `GET` | `/api/v1/skills/:id` | Auth | Get single skill details |
| `GET` | `/api/v1/career-analysis` | Auth | Deterministic skill gap & readiness score |
| `GET` | `/api/v1/assessments` | Auth | List assessments |
| `GET` | `/api/v1/assessments/:id` | Auth | Start assessment (anti-leak sanitized) |
| `POST` | `/api/v1/assessments/:id/submit` | Auth | Submit assessment & grade answers |
| `GET` | `/api/v1/assessments/attempts/me` | Auth | List user's assessment attempts |
| `GET` | `/api/v1/roadmaps/active`, `/me` | Auth | Get active personalized roadmap |
| `POST` | `/api/v1/roadmaps/generate` | Auth | AI roadmap generator targeting gaps |
| `PATCH`/`PUT` | `/api/v1/roadmaps/tasks/:taskId` | Auth | Toggle milestone task completion |
| `GET` | `/api/v1/projects` | Auth | List student portfolio projects |
| `POST` | `/api/v1/projects` | Auth | Add project & update project readiness |
| `GET` | `/api/v1/projects/recommendations` | Auth | AI project recommendations for gaps |
| `PUT` | `/api/v1/projects/:id` | Auth | Update project |
| `DELETE`| `/api/v1/projects/:id` | Auth | Delete project |
| `POST` | `/api/v1/resumes/analyze`, `/upload` | Auth | ATS resume scoring via Gemini AI |
| `GET` | `/api/v1/resumes/latest` | Auth | Fetch latest resume analysis |
| `GET` | `/api/v1/resumes/history` | Auth | List past resume evaluations |
| `POST` | `/api/v1/interviews/start`, `/` | Auth | Start AI mock interview session |
| `POST` | `/api/v1/interviews/:sessionId/answer` | Auth | Submit answer & advance question |
| `GET` | `/api/v1/interviews/:sessionId` | Auth | Get interview session details |
| `GET` | `/api/v1/interviews/history` | Auth | List past interview sessions |
| `GET` | `/api/v1/jobs` | Auth | List jobs with match percentages |
| `GET` | `/api/v1/jobs/:id` | Auth | Get job details with match breakdown |
| `POST` | `/api/v1/jobs` | Admin | Post job vacancy |
| `POST` | `/api/v1/jobs/:id/apply` | Auth | Submit job application |
| `GET` | `/api/v1/jobs/applications/me` | Auth | List student job applications |
| `GET` | `/api/v1/dashboard/student` | Auth | Aggregated student portal payload |
| `GET` | `/api/v1/dashboard/admin` | Admin | Institutional executive analytics |
| `GET` | `/api/v1/admin/students` | Admin | Paginated student roster with filters |
| `GET` | `/api/v1/admin/departments` | Admin | Department list with student counts |
| `GET` | `/api/v1/admin/analytics/placements` | Admin | Placement conversion pipeline stats |

---

## Architectural Guarantees for Person 2 & Person 3

1. **Zero Route Drift**: All paths, query parameters, request bodies, and response envelopes adhere 100% to `docs/API_CONTRACT.md` and `docs/openapi.yaml`.
2. **Contract Aliases Included**: Both standard REST (`/api/v1/roadmaps/active`, `/api/v1/resumes/analyze`, `/api/v1/interviews/start`) and contract convenience routes (`/api/v1/roadmaps/me`, `/api/v1/resumes/upload`, `/api/v1/interviews`) are simultaneously active and tested.
3. **Strict Tenancy & Role Guards**: Students cannot access `/api/v1/dashboard/admin` or `/api/v1/admin/*`, and college data is isolated strictly by `req.user.organizationId`.
4. **Resilient AI Layer**: All AI services include deterministic fallback responses so UI dev proceeds smoothly even without a Gemini API key.