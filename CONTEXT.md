# CareerOS — Development Context File

> ⚠️ IMPORTANT: Read this file first whenever switching IDEs or resuming work.
> Update this file after every phase completes.

---

## Current Status

- **Active Branch**: `backend/core`
- **Active Developer**: Person 1 (Backend & AI)
- **Phase**: Phase 5 — Assessments (READY TO START)
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
- Career & Skill test suite passing (`tests/careerSkill.test.js` - 7 test cases, total 28 passed across test suites)

---

## Next Phase

### 🔄 Phase 5 — Assessments

**Goal**: Implement Assessment system, Questions, Attempt tracking, deterministic scoring, skill level verification updates, and REST endpoints.

**Files to implement:**
- [ ] `apps/backend/src/models/assessment.model.js`
- [ ] `apps/backend/src/models/assessmentAttempt.model.js`
- [ ] `apps/backend/src/validators/assessment.validator.js`
- [ ] `apps/backend/src/services/assessment.service.js`
- [ ] `apps/backend/src/controllers/assessment.controller.js`
- [ ] `apps/backend/src/routes/assessment.routes.js`
- [ ] `apps/backend/tests/assessment.test.js`

---

## Upcoming Phases

| Phase | Title | Status |
| :--- | :--- | :--- |
| Phase 5 | Assessments | 🔄 Next |
| Phase 6 | Career Gap Engine | ⏳ Pending |
| Phase 7 | Gemini AI Integration | ⏳ Pending |
| Phase 8 | Roadmaps | ⏳ Pending |
| Phase 9 | Projects | ⏳ Pending |
| Phase 10 | Resume | ⏳ Pending |
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