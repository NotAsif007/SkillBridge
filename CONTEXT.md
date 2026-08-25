# CareerOS — Development Context File

> ⚠️ IMPORTANT: Read this file first whenever switching IDEs or resuming work.
> Update this file after every phase completes.

---

## Current Status

- **Active Branch**: `backend/core`
- **Active Developer**: Person 1 (Backend & AI)
- **Phase**: Phase 2 — Authentication (READY TO START)
- **Last Updated**: 2026-08-25

---

## Completed Phases

### ✅ Phase 0 — Repository Foundation
- Monorepo initialized at `c:\Users\ASUS\Desktop\careerOS`
- Git remote: `https://github.com/NotAsif007/careerOS.git`
- Branches: `main`, `develop`, `backend/core`
- All docs written: `SPEC.md`, `docs/API_CONTRACT.md`, `docs/openapi.yaml`, `docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`
- Full file tree scaffolded (empty files, all modules)

### ✅ Phase 1 — Backend Foundation
- Express app bootstrap (`app.js`, `server.js`)
- MongoDB connection manager with Mongoose (`src/config/db.js`)
- Environment validation (`src/config/env.js`)
- Security middleware: Helmet, CORS, Rate Limiters (`src/middleware/rateLimiter.middleware.js`)
- Centralized Error Handling & AppError (`src/utils/errors.js`, `src/middleware/error.middleware.js`)
- Standardized API Response Envelopes (`src/utils/responseEnvelope.js`)
- Zod Request Validator middleware (`src/middleware/validate.middleware.js`)
- Health Check API (`GET /api/v1/health`)
- Automated tests passing via Jest + mongodb-memory-server (`tests/health.test.js`)

---

## Next Phase

### 🔄 Phase 2 — Authentication (Google OAuth / JWT)

**Goal**: Complete Google OAuth 2.0 / OpenID Connect + JWT Session management and Role-Based Access Control.

**Files to implement:**
- [ ] `apps/backend/src/models/user.model.js`
- [ ] `apps/backend/src/integrations/google/oauthClient.js`
- [ ] `apps/backend/src/services/auth.service.js`
- [ ] `apps/backend/src/controllers/auth.controller.js`
- [ ] `apps/backend/src/middleware/auth.middleware.js`
- [ ] `apps/backend/src/middleware/role.middleware.js`
- [ ] `apps/backend/src/validators/auth.validator.js`
- [ ] `apps/backend/src/routes/auth.routes.js`
- [ ] `apps/backend/tests/auth.test.js`

---

## Upcoming Phases

| Phase | Title | Status |
| :--- | :--- | :--- |
| Phase 2 | Authentication (Google OAuth / JWT) | 🔄 Next |
| Phase 3 | Profiles & Organizations | ⏳ Pending |
| Phase 4 | Careers & Skills + Seed Data | ⏳ Pending |
| Phase 5 | Assessments | ⏳ Pending |
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