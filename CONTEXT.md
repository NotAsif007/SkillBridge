# CareerOS — Development Context File

> ⚠️ IMPORTANT: Read this file first whenever switching IDEs or resuming work.
> Update this file after every phase completes.

---

## Current Status

- **Active Branch**: `backend/core`
- **Active Developer**: Person 1 (Backend & AI)
- **Phase**: Phase 10 — Resume (READY TO START)
- **Last Updated**: 2026-08-25

---

## Completed Phases

### ✅ Phase 0 — Repository Foundation
- Monorepo initialized at `c:\Users\ASUS\Desktop\careerOS`
- Git remote: `https://github.com/NotAsif007/careerOS.git`
- Branches: `main`, `develop`, `backend/core`
- All docs written: `SPEC.md`, `docs/API_CONTRACT.md`, `docs/openapi.yaml`, `docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`
- Full file tree scaffolded

### ✅ Phase 1 — Backend Foundation
- Express app bootstrap (`app.js`, `server.js`)
- MongoDB connection manager with Mongoose (`src/config/db.js`)
- Security middleware: Helmet, CORS, Rate Limiters (`src/middleware/rateLimiter.middleware.js`)
- Centralized Error Handling & AppError (`src/utils/errors.js`, `src/middleware/error.middleware.js`)
- Standardized API Response Envelopes (`src/utils/responseEnvelope.js`)
- Zod Request Validator middleware (`src/middleware/validate.middleware.js`)
- Health Check API (`GET /api/v1/health`)
- Automated tests passing via Jest (`tests/health.test.js`)

### ✅ Phase 2 — Authentication
- User Mongoose Model (`src/models/user.model.js`)
- Google OAuth / OpenID Connect token verification service (`src/integrations/google/oauthClient.js`)
- JWT Token Issuance, verification, and session management (`src/services/auth.service.js`)
- Auth Middleware (`requireAuth`, `requireRole`, `requireOrganizationAccess`)
- Auth Endpoints (`POST /api/v1/auth/google`, `POST /api/v1/auth/dev-login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`)
- Multi-Tenant Organization boundary enforcement (`src/middleware/organizationScope.middleware.js`)
- Auth test suite passing (`tests/auth.test.js` - 10 test cases)

### ✅ Phase 3 — Profiles & Organizations
- `StudentProfile` Model (`src/models/studentProfile.model.js`)
- `Organization` and `Department` Models (`src/models/organization.model.js`, `src/models/department.model.js`)
- Profile Service with auto-initialization (`src/services/profile.service.js`)
- Profile Endpoints (`GET /api/v1/profile`, `PUT /api/v1/profile`, `POST /api/v1/profile/skills`, `PUT /api/v1/profile/target-career`)
- Profile test suite passing (`tests/profile.test.js` - 8 test cases)

### ✅ Phase 4 — Careers & Skills + Seed Data
- `CareerRequirement` Model (`src/models/careerRequirement.model.js`)
- `Skill` and `Career` Models (`src/models/skill.model.js`, `src/models/career.model.js`)
- Career and Skill Services (`src/services/career.service.js`, `src/services/skill.service.js`)
- Career and Skill Controllers & Routes (`GET /api/v1/careers`, `GET /api/v1/careers/:id`, `GET /api/v1/skills`)
- Comprehensive Database Seed Script (`scripts/seed.js` with apex org, 4 depts, 3 standard users, 37 master skills, 6 top careers with weighted requirements, sample student profile)
- Career & Skill test suite passing (`tests/careerSkill.test.js` - 7 test cases)

### ✅ Phase 5 — Assessments
- `Assessment` and `AssessmentAttempt` Models (`src/models/assessment.model.js`, `src/models/assessmentAttempt.model.js`)
- Assessment Service with answer-leak protection & automatic skill verification on pass (`src/services/assessment.service.js`)
- Assessment Endpoints (`GET /api/v1/assessments`, `GET /api/v1/assessments/:id`, `POST /api/v1/assessments/:id/submit`, `GET /api/v1/assessments/attempts/me`)
- Assessment test suite passing (`tests/assessment.test.js` - 6 test cases)

### ✅ Phase 6 — Career Gap Engine
- Deterministic weighted scoring algorithm evaluating student skills against career requirements
- Dynamic categorization of `matchedSkills`, `weakSkills`, and `missingSkills`
- Gap-weighted `prioritySkills` ranking: `weight * (gap + 1)`
- Institutional weight customization (`technicalSkills` 30%, `assessments` 20%, `projects` 15%, `resume` 10%, `interviews` 15%, `roadmap` 10%)
- Live `StudentProfile.readinessScore` synchronization in database
- Support for target career override analysis (`?careerId=...`)
- Career Gap Engine API (`GET /api/v1/career-analysis`)
- Gap Engine test suite passing (`tests/gapEngine.test.js` - 4 test cases)

### ✅ Phase 7 — Gemini AI Integration
- `AIGeneration` Model (`src/models/aiGeneration.model.js`) for audit trails and token tracking
- `GeminiClient` singleton (`src/integrations/gemini/geminiClient.js`)
- Structured JSON AI engine (`src/integrations/gemini/gemini.service.js`)
- Gemini AI test suite passing (`tests/gemini.test.js` - 5 test cases)

### ✅ Phase 8 — Roadmaps
- `Roadmap` Model (`src/models/roadmap.model.js`) with milestones and task completion status
- Roadmap Service with AI plan generation targeting identified skill gaps (`src/services/roadmap.service.js`)
- Task completion toggle & automatic progress recalculation (`PATCH /api/v1/roadmaps/tasks/:taskId`)
- Readiness score synchronization (`roadmapProgress` weight in placement score)
- Roadmap Endpoints (`GET /api/v1/roadmaps/active`, `POST /api/v1/roadmaps/generate`, `PATCH /api/v1/roadmaps/tasks/:taskId`)
- Roadmap test suite passing (`tests/roadmap.test.js` - 6 test cases)

### ✅ Phase 9 — Projects
- `Project` Model (`src/models/project.model.js`) for student portfolio items
- Project Service with CRUD, AI project recommendation generation, and deterministic score computation (`src/services/project.service.js`)
- Automatic placement readiness project score updates (`projects` weight)
- Project Endpoints (`GET /api/v1/projects`, `POST /api/v1/projects`, `PUT /api/v1/projects/:id`, `DELETE /api/v1/projects/:id`, `GET /api/v1/projects/recommendations`)
- Project test suite passing (`tests/project.test.js` - 6 test cases, total 55 passed across test suites)

---

## Next Phase

### 🔄 Phase 10 — Resume

**Goal**: Implement student Resume upload, ATS evaluation via Gemini AI, Resume analysis history, and placement readiness resume score synchronization.

**Files to implement:**
- [ ] `apps/backend/src/models/resume.model.js`
- [ ] `apps/backend/src/validators/resume.validator.js`
- [ ] `apps/backend/src/services/resume.service.js`
- [ ] `apps/backend/src/controllers/resume.controller.js`
- [ ] `apps/backend/src/routes/resume.routes.js`
- [ ] `apps/backend/tests/resume.test.js`

---

## Upcoming Phases

| Phase | Title | Status |
| :--- | :--- | :--- |
| Phase 10 | Resume | 🔄 Next |
| Phase 11 | AI Interviews | ⏳ Pending |
| Phase 12 | Jobs & Applications | ⏳ Pending |
| Phase 13 | Student Dashboard API | ⏳ Pending |
| Phase 14 | College Admin Analytics | ⏳ Pending |

---

## Architecture Rules (Never Forget)

- Route → Middleware → Validator → Controller → Service → Model → MongoDB
- Controllers must be thin — no business logic
- All business logic lives in services/
- All responses use `responseEnvelope.js` helpers
- Never expose organizationId from client input — always from `req.user`
- All errors use `AppError` class
- Every API change must update: `docs/openapi.yaml`, `docs/API_CONTRACT.md`, and tests

---

## Key File Locations

| Resource | Path |
| :--- | :--- |
| Specification | `SPEC.md` |
| API Contracts | `docs/API_CONTRACT.md` |
| OpenAPI Spec | `docs/openapi.yaml` |
| Database Schemas | `docs/DATABASE.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Design System | `docs/DESIGN.md` |
| Backend Entry | `apps/backend/src/server.js` |
| Express App | `apps/backend/src/app.js` |
| Routes Index | `apps/backend/src/routes/index.js` |
| Environment | `apps/backend/.env` |
| Backend Tests | `apps/backend/tests/` |
| Seed Scripts | `apps/backend/scripts/seed.js` |