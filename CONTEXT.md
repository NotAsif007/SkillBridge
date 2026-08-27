# CareerOS — Continuation Context

**Updated:** 2026-08-27  
**Workspace:** `C:\Users\ASUS\Desktop\careerOS`  
**Purpose:** Read this before continuing implementation. It records the current state, architecture decisions, and verification records.

---

## Product & Architectural Guardrails

CareerOS is an enterprise multi-tenant student placement-readiness platform (React 18 / Vite, Node.js / Express, MongoDB Atlas). The authoritative requirements are in `SPEC.md` and `docs/`.

- **Deterministic Core**: Backend readiness calculations and job matching are deterministic; AI (Google Gemini 3.5 Flash) only enriches explanations, roadmaps, and interview dialogues.
- **Multi-Tenant Boundaries**: Organization scoping (`organizationId`) and role checks are enforced server-side.
- **Design System**: Dual-theme architecture — **Apple Light Mode** (crisp `#FFFFFF` surfaces, `#F5F5F7` canvas, `#1D1D1F` typography) and **Yellow Graphite Dark Mode** (`#191B22` surfaces, `#121317` canvas, `#2B2E3C` borders) with harmonious multi-accent tokens (Amber, Emerald, Teal, Indigo, Rose) and smooth `0.25s` global transitions.
- **Code Organization**: Clean modular layered architecture with centralized barrel exports across `models/`, `services/`, `controllers/`, `middleware/`, `components/common/`, `components/ui/`, `styles/`, `context/`, and `hooks/`.

---

## Current State & Recent Accomplishments

### 1. Monorepo Root Tooling & Professional Configuration
- Added `.editorconfig` enforcing standard UTF-8, LF line endings, 2-space indentation.
- Added `.prettierrc` for standardized code formatting across the repository.
- Configured root `package.json` workspace scripts (`npm run dev:backend`, `npm run dev:frontend`, `npm test`, `npm run build`, `npm run seed`, `npm run test:smoke`).

### 2. Centralized Barrel Exports & Code Cleanliness
- **Backend**:
  - `apps/backend/src/models/index.js` — All 16 Mongoose models exported cleanly.
  - `apps/backend/src/services/index.js` — All 13 business logic services exported cleanly.
  - `apps/backend/src/controllers/index.js` — All 14 route controllers exported cleanly.
  - `apps/backend/src/middleware/index.js` — All auth, role, upload, rate-limit, error, and correlation middleware exported cleanly.
- **Frontend**:
  - `apps/frontend/src/styles/index.js` — Single source of truth for `getTokens(isDark)` and design tokens.
  - `apps/frontend/src/components/common/index.js` — `AppShell`, `ProfileSettingsModal`, `MetricCard`, `RouteGuards`.
  - `apps/frontend/src/components/ui/index.js` — `Badge`, `Button`, `Card`, `Modal`, `Progress`, `Table`, `Tabs`, `Input`, `Skeleton`.
  - `apps/frontend/src/context/index.js` — `AuthProvider`, `ThemeProvider`, `ToastProvider`, and custom hooks.
  - `apps/frontend/src/api/index.js` — Axios client, `authApi`, `studentApi`, `adminApi`.
  - `apps/frontend/src/hooks/index.js` — `useDebounce`, `useMediaQuery`.

### 3. Visual & UI/UX System
- Replaced hardcoded static tokens across all feature views (`CareerAnalysis`, `CareerList`, `CareerDetail`, `AssessmentList`, `AssessmentTake`, `AssessmentResult`, `RoadmapView`, `MilestoneTimeline`, `ProjectList`, `ProjectModal`, `InterviewSetup`, `InterviewSession`, `InterviewReport`, `ResumeUpload`, `ResumeAnalysisView`, `JobList`, `JobCard`, `StudentProfile`) with dynamic `useTheme()` + `getTokens(isDark)`.
- Enabled silky-smooth global transitions (`transition: background-color 0.25s ease, border-color 0.25s ease, color 0.15s ease`) across the app shell.
- Added interactive `ProfileSettingsModal` for live profile editing and theme toggling.
- Removed artificial marketing copy and version badges.

### 4. Persona & Institutional Branding
- **Institution**: Assam Down Town University (ADTU).
- **Student Persona**: `Suraj` (`suraj@adtu.edu.in`) — Senior CS Student.
- **Admin Persona**: `Asif` (`asif@adtu.edu.in`) — Placement Dean.

---

## Verification Record

- **Backend Test Suite**: `npm test` (`npm --workspace=apps/backend test`) — **15/15 test suites passed; 93/93 tests passed (100%)**.
- **Frontend Production Build**: `npm run build` (`npm --workspace=apps/frontend run build`) — **Passed with 0 errors** (2,455 modules transformed, 31 clean chunks).
- **Dev Servers**: Running smoothly on Port 5000 (Backend API) and Port 5173 (Frontend SPA).
