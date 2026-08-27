# 🚀 CareerOS

> **Enterprise AI Placement Readiness & Career Operating System for Universities and Students.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-3.5_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev)
[![Tests](https://img.shields.io/badge/Tests-93%2F93_Passing-10B981?logo=jest&logoColor=white)](https://jestjs.io)

---

## 📌 Overview

**CareerOS** is an enterprise-grade placement operating system engineered for universities, placement cells, and engineering students.

Traditional campus placements are often reactive: students apply to recruitment drives with generic resumes and unverified skills, while universities lack real-time visibility into student skill deficiencies. CareerOS bridges this gap by providing an end-to-end platform combining **deterministic readiness gap scoring**, **personalized AI learning roadmaps**, **in-memory ATS resume audits**, **multi-turn technical mock interviews**, and **institutional placement cohort analytics**.

---

## 🎨 Design System & Theme Engine

CareerOS features a dual-theme design system engineered for high legibility and focus:

- **Apple Light Mode**: Crisp white surfaces (`#FFFFFF`), light canvas (`#F5F5F7`), slate-900 typography (`#1D1D1F`), and muted `#6E6E73` captions.
- **Yellow Graphite Dark Mode**: Warm charcoal graphite surfaces (`#191B22`), deep canvas (`#121317`), border separation (`#2B2E3C`), and high-contrast typography (`#F3F4F6`).
- **Harmonious Multi-Accent Tokens**:
  - 🟡 **Warm Amber Gold (`#F59E0B` / `#FBBF24`)**: Active navigation, primary actions, and milestone progression.
  - 🟢 **Emerald Green (`#10B981` / `#34D399`)**: Verified skills, passed assessments, and high match scores.
  - 🔵 **Cyan / Teal (`#06B6D4` / `#22D3EE`)**: Diagnostic assessments, durations, and emerging benchmarks.
  - 🟣 **Indigo (`#6366F1` / `#818CF8`)**: Technical tags, AI insights, and career track categories.
  - 🔴 **Rose / Coral (`#F43F5E` / `#FB7185`)**: Critical missing skill gaps, deadline notices, and error alerts.
- **Silky Smooth Transitions**: Global `0.25s` ease transitions on backgrounds, borders, and text colors.

---

## 🚀 Core Features & Logical Engines

### 🎓 1. Student Workspace

- **🎯 Deterministic Career Gap Engine**:
  - Compares a student’s verified skills against standardized industry benchmarks (Full Stack, Backend, Data Engineer, DevOps, etc.).
  - Calculates a weighted composite **Readiness Score (0–100%)** evaluating 6 canonical pillars: Technical Skills (30%), Skill Assessments (20%), Verified Projects (15%), ATS Resume Quality (10%), Mock Interview Performance (15%), and Roadmap Milestones (10%).
  - Organization weight customizations are dynamically merged and normalized with defaults.
  - Assessment readiness relies on the latest attempt per required skill, and duplicate skills resolve to the highest proficiency.
  - Automatically identifies missing and weak skills with actionable priority rankings. Target career selection is explicit via `/api/v1/profile/target-career`.

- **⚡ Dynamic AI Roadmap Engine**:
  - Leverages Google Gemini AI (`gemini-3.5-flash-lite`) to generate customized, week-by-week milestone roadmaps tailored to the student's unique skill gaps.
  - Includes interactive task checkoffs, resource links, and reversible completion toggling.

- **📄 ATS Resume Diagnostic Engine**:
  - Features high-performance in-memory PDF parsing (`pdf-parse` + `multer`).
  - Analyzes keyword density, section structure, impact metrics, strengths, weaknesses, and generates actionable bullet point improvements.

- **🤖 Multi-Turn AI Mock Interview Engine**:
  - Conversational technical interview state machine powered by Gemini AI.
  - Dynamically asks follow-up technical questions based on prior candidate answers with split-screen answer editor and real-time rubric evaluation.

- **📝 Secure Skill Assessments**:
  - Timed assessments across programming languages, system design, and frameworks.
  - Anti-cheat architecture ensuring zero answer-key leaks to the client before submission.
  - Passing an assessment automatically mints verified skill credentials to the student profile.

- **💼 Matched Campus Jobs & Application Engine**:
  - Ranks campus job postings based on real-time percentage match against the student's skill profile.
  - Rigorously validates student eligibility: checks minimum CGPA (`profile.cgpa`), department constraints, graduation year, and application deadlines.
  - Scoped to the student's verified college organization.

---

### 🏛️ 2. College Administrator Console

- **📊 Cohort Placement Analytics**:
  - Real-time placement readiness KPI distributions across batches and graduation years.
  - Departmental performance comparisons (CSE, IT, ECE).
  - Institutional top skill gap rankings to guide curriculum interventions.

- **📋 Searchable Student Roster & Drawer**:
  - Multi-filter student directory (by department, minimum readiness score, graduation year, and search).
  - Slide-over detail drawer inspecting individual student progress, verified skills, and placement status.

- **📈 Campus Placement Funnel**:
  - Live recruitment drive tracking across all hiring stages: `Applied` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Offered`.

- **🏢 Department & Job Management**:
  - Create and manage academic departments and campus drive eligibility criteria (minimum CGPA, salary brackets).

---

### 🛡️ 3. Security, Observability & Architecture

- **Multi-Tenant Data Isolation**: Complete tenant partitioning by `organizationId` across all student profiles, jobs, assessments, and queries.
- **Google OAuth 2.0 (GSI)**: Integrated Google Identity Services authentication with server-side ID token verification via `google-auth-library`.
- **Request Correlation (`X-Request-ID`)**: Every incoming request is assigned or propagates an `X-Request-ID` header, returned in responses, exposed in CORS, and logged across all lifecycle events.
- **Structured Logging & Redaction**: Production logs are structured with method, URL, status, duration, and actor context. Sensitive keys (passwords, tokens, cookies, auth headers) are automatically redacted.
- **Graceful Lifecycle & Shutdown**: Standardized error handling, isolated stack traces in development, and guarded graceful shutdown routines (disconnecting DB and closing server with 10s safety timeout).
- **Session Lifecycle & Invalidation**: Token versioning and `lastLogoutAt` tracking for server-side token revocation upon logout.
- **Route-Level Code Splitting**: Frontend routes use `React.lazy` and `Suspense` for lightning-fast initial load times.

---

## 📂 Project Structure

```text
careeros/
├── .editorconfig                # Standard cross-editor rules
├── .prettierrc                  # Consistent code formatting configuration
├── package.json                 # Monorepo root workspace orchestration
│
├── apps/
│   ├── backend/                 # Node.js + Express REST API & AI Engines
│   │   ├── src/
│   │   │   ├── config/          # Environment & database configuration
│   │   │   ├── controllers/     # Express route controllers (+ barrel index.js)
│   │   │   ├── integrations/    # Google Gemini AI & Google OAuth clients
│   │   │   ├── middleware/      # Auth, CORS, rate limiting, error, correlation (+ barrel index.js)
│   │   │   ├── models/          # Mongoose multi-tenant schemas (+ barrel index.js)
│   │   │   ├── routes/          # REST API endpoints
│   │   │   ├── services/        # Business logic & gap analysis engines (+ barrel index.js)
│   │   │   ├── utils/           # Response envelopes, errors, logger, regex sanitizers
│   │   │   └── validators/      # Zod request validation schemas
│   │   ├── scripts/             # Database seeders & smoke test runners
│   │   └── tests/               # 15 Jest automated test suites (93 tests)
│   │
│   └── frontend/                # React 18 + Vite Single Page Application
│       └── src/
│           ├── api/             # Axios API client & domain service exports
│           ├── app/             # Router (code-split) & App providers
│           ├── components/      # Common UI components, AppShell, route guards
│           │   ├── common/      # AppShell.jsx, ProfileSettingsModal.jsx (+ barrel index.js)
│           │   ├── ui/          # Badge, Button, Card, Modal, Progress, Table (+ barrel index.js)
│           │   └── charts/      # Recharts wrappers & readiness distribution
│           ├── context/         # AuthContext, ThemeContext, ToastContext (+ barrel index.js)
│           ├── features/
│           │   ├── student/     # Student portal (Dashboard, Resume, Roadmap, Interview, Jobs)
│           │   └── admin/       # College admin (Analytics, Rosters, Departments, Jobs)
│           ├── hooks/           # Custom reusable hooks (useDebounce, useMediaQuery)
│           ├── layouts/         # StudentLayout & AdminLayout (thin AppShell wrappers)
│           ├── pages/           # Login & Institutional Splash Portal
│           └── styles/          # Unified design tokens (themeTokens.js)
│
├── docs/                        # Specifications, Database Schemas, API Contracts, Design
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DESIGN.md
│   └── openapi.yaml
│
├── CONTEXT.md                   # Continuation context & handoff log
└── SPEC.md                      # Complete system specifications
```

---

## ⚡ Monorepo CLI Commands

You can run commands directly from the root workspace:

```bash
# 1. Install all dependencies across workspaces
npm install

# 2. Seed database with demo university, careers, skills, and personas
npm run seed

# 3. Start backend development server (Port 5000)
npm run dev:backend

# 4. Start frontend development server (Port 5173)
npm run dev:frontend

# 5. Run full backend automated test suites (15 suites, 93 tests)
npm test

# 6. Run backend smoke test
npm run test:smoke

# 7. Run frontend production build
npm run build
```

---

## 👥 Demo Sandbox Personas

When running locally, you can use the pre-configured 1-click sandbox logins on the **`/login`** page:

- **Student Persona**: `Suraj` (`suraj@adtu.edu.in`) — CS Senior at Assam Down Town University.
- **Admin Persona**: `Asif` (`asif@adtu.edu.in`) — Placement Dean at Assam Down Town University.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.