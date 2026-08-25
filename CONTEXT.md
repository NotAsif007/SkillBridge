# CareerOS — Development Context File

> ⚠️ IMPORTANT: Read this file first whenever switching IDEs or resuming work.
> Update this file after every phase completes.

---

## Current Status

- **Active Branch**: `backend/core`
- **Active Developer**: Person 1 (Backend & AI)
- **Phase**: Phase 3 — Profiles & Organizations (READY TO START)
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
- Auth Endpoints:
  - `POST /api/v1/auth/google` (Google OAuth ID Token verification & auto-registration)
  - `POST /api/v1/auth/dev-login` (Fast dev/test token generation, disabled in production)
  - `GET /api/v1/auth/me` (Authenticated profile retrieval with organization/department population)
  - `POST /api/v1/auth/logout`
- Multi-Tenant Organization boundary enforcement (`src/middleware/organizationScope.middleware.js`)
- Full Auth test suite passing (`tests/auth.test.js` - 10 test cases)

---

## Next Phase

### 🔄 Phase 3 — Profiles & Organizations

**Goal**: Implement Organization, Department, and StudentProfile models and REST APIs.

**Files to implement:**
- [ ] `apps/backend/src/models/studentProfile.model.js`
- [ ] `apps/backend/src/validators/profile.validator.js`
- [ ] `apps/backend/src/services/profile.service.js`
- [ ] `apps/backend/src/controllers/profile.controller.js`
- [ ] `apps/backend/src/routes/profile.routes.js`
- [ ] `apps/backend/tests/profile.test.js`

---

## Upcoming Phases

| Phase | Title | Status |
| :--- | :--- | :--- |
| Phase 3 | Profiles & Organizations | 🔄 Next |
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