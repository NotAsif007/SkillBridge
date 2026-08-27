# SkillBridge

Career and placement readiness platform for universities, academic institutions, and engineering students.

[![Netlify Status](https://api.netlify.com/api/v1/badges/0ebcaa89-3343-484d-ac5f-b5cfaf180315/deploy-status)](https://app.netlify.com/projects/skillbridge012/deploys)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-3.5_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev)
[![Tests](https://img.shields.io/badge/Tests-93%2F93_Passing-10B981?logo=jest&logoColor=white)](https://jestjs.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

SkillBridge is a multi-tenant placement operating system designed to bridge the gap between academic preparation and industry hiring standards. The platform replaces subjective self-assessment with deterministic skill verification, structured readiness metrics, AI-assisted learning paths, in-memory ATS resume diagnostics, and adaptive technical mock interviews.

Institutional placement teams receive real-time cohort analytics to detect departmental skill deficiencies and track campus recruitment funnels across batches.

---

## Core Capabilities

### 1. Student Placement Workspace

- **Deterministic Career Gap Engine**: Evaluates student competency against standardized industry profiles (e.g., Full Stack Engineer, Backend Engineer, Cloud/DevOps, Data Analyst). Computes a 0–100 composite Readiness Score weighted across six canonical pillars:
  - Technical Skill Verification (30%)
  - Skill Assessments (20%)
  - Verified Projects (15%)
  - ATS Resume Quality (10%)
  - Technical Mock Interviews (15%)
  - Roadmap Progression (10%)
  
  Institutional weight overrides are normalized dynamically against defaults. Assessment scores prioritize the latest completed attempt per required competency, and duplicate skills resolve to the highest verified level.

- **Dynamic Roadmap Generation**: Uses Google Gemini 3.5 Flash to generate personalized, week-by-week milestone paths based on the student's specific skill deficits, complete with milestone task tracking and resource references.

- **ATS Resume Analysis**: Performs in-memory PDF extraction (`pdf-parse`) and multi-factor evaluation covering structural integrity, keyword alignment against target careers, impact metric density, and actionable rewrite recommendations.

- **Adaptive Technical Interview Engine**: Multi-turn technical interview simulator with real-time prompt generation, contextual follow-ups based on candidate responses, and post-session rubric scoring.

- **Skill Assessment Engine**: Timed multiple-choice evaluations across programming languages, data structures, and system design. Employs a secure architecture where answer keys remain server-side until submission. Passing results automatically verify competencies on the student's profile.

- **Job Matching & Eligibility Engine**: Computes role compatibility percentages based on student skill overlap while strictly enforcing eligibility rules: minimum CGPA (`profile.cgpa`), department criteria, graduation year, and application deadlines.

---

### 2. Administrator Console

- **Cohort Readiness Analytics**: Real-time readiness distributions, department benchmarks (CSE, IT, ECE), and campus-wide skill deficit rankings to inform curriculum updates.
- **Student Directory & Detail Drawer**: Multi-parameter search and filtering (by readiness threshold, department, and graduation year) with slide-over profiles showing verified credentials and placement progress.
- **Recruitment Funnel**: End-to-end recruitment tracking across hiring stages: `Applied` &rarr; `Under Review` &rarr; `Shortlisted` &rarr; `Interview Scheduled` &rarr; `Offered`.
- **Department & Drive Management**: Management of academic departments, placement policies, and job postings scoped to the institution.

---

## System Architecture

```text
skillbridge/
├── apps/
│   ├── backend/                 # Node.js + Express REST API
│   │   ├── src/
│   │   │   ├── config/          # Environment validation & DB connection
│   │   │   ├── controllers/     # Route controllers (+ barrel index.js)
│   │   │   ├── integrations/    # Gemini AI & Google OAuth clients
│   │   │   ├── middleware/      # Auth, CORS, rate-limit, error, correlation (+ barrel index.js)
│   │   │   ├── models/          # Multi-tenant Mongoose schemas (+ barrel index.js)
│   │   │   ├── routes/          # API route definitions
│   │   │   ├── services/        # Domain logic & gap scoring engines (+ barrel index.js)
│   │   │   ├── utils/           # Structured logger, response envelopes, sanitizers
│   │   │   └── validators/      # Zod validation schemas
│   │   ├── scripts/             # Database seeder & smoke tests
│   │   └── tests/               # 15 Jest test suites (93 tests)
│   │
│   └── frontend/                # React 18 + Vite SPA
│       └── src/
│           ├── api/             # Axios client & domain endpoints (+ barrel index.js)
│           ├── app/             # Router with code-splitting (React.lazy)
│           ├── components/      # Reusable UI primitives & AppShell (+ barrel index.js)
│           ├── context/         # Auth, Theme, and Toast contexts (+ barrel index.js)
│           ├── features/
│           │   ├── student/     # Student screens (Dashboard, Careers, Roadmap, Interview, Jobs)
│           │   └── admin/       # Admin screens (Analytics, Students, Departments, Jobs)
│           ├── hooks/           # Custom utility hooks (useDebounce, useMediaQuery)
│           ├── layouts/         # Layout wrappers for student and admin shells
│           ├── pages/           # Authentication & landing portal
│           └── styles/          # Unified design tokens (themeTokens.js)
│
├── docs/                        # Specifications, API contracts, deployment guides
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── DESIGN.md
│   └── openapi.yaml
│
├── CONTEXT.md                   # Architectural state & handoff log
├── SPEC.md                      # System specification
├── render.yaml                  # Render deployment blueprint
└── package.json                 # Monorepo workspace orchestration
```

---

## Design System

The frontend implements a unified token-driven interface with smooth transitions (`0.25s` ease):

- **Apple Light Mode**: Crisp white surfaces (`#FFFFFF`), light gray canvas (`#F5F5F7`), slate-900 typography (`#1D1D1F`), and `#E5E5EA` border separation.
- **Yellow Graphite Dark Mode**: Warm charcoal surfaces (`#191B22`), deep graphite canvas (`#121317`), `#2B2E3C` borders, and high-contrast typography (`#F3F4F6`).
- **Semantic Palette**:
  - **Amber Gold (`#F59E0B` / `#FBBF24`)**: Active navigation, primary actions, milestones.
  - **Emerald Green (`#10B981` / `#34D399`)**: Verified skills, passed benchmarks, high readiness scores.
  - **Cyan / Teal (`#06B6D4` / `#22D3EE`)**: Assessments, durations, emerging status.
  - **Indigo (`#6366F1` / `#818CF8`)**: Technical tags, category chips, AI insight panels.
  - **Rose / Coral (`#F43F5E` / `#FB7185`)**: Critical missing skill gaps, deadline notices, error alerts.

---

## Security and Observability

- **Tenant Isolation**: Multi-tenant isolation enforced at the database layer via `organizationId`. Client-supplied tenant IDs are rejected in favor of verified session claims.
- **Request Tracing**: All requests receive a unique `X-Request-ID` header, propagated through CORS and recorded across all lifecycle logs.
- **Structured Redacting Logger**: Request and application logs capture HTTP method, route, duration, status, and actor context while automatically redacting sensitive fields (passwords, tokens, API keys, cookies, auth headers).
- **Session Revocation**: Token versioning and `lastLogoutAt` tracking allow immediate server-side session invalidation.
- **Graceful Lifecycle Management**: Guarded shutdown routines intercept termination signals (`SIGINT`, `SIGTERM`), closing active connections and terminating MongoDB sessions within a 10-second timeout.

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local instance or MongoDB Atlas cluster
- **Google Cloud Console**: OAuth 2.0 Web Client credentials (optional for dev login)
- **Google AI Studio**: Gemini API key

---

### Local Installation

```bash
# Clone the repository
git clone https://github.com/NotAsif007/SkillBridge.git
cd SkillBridge

# Install dependencies across all workspaces
npm install

# Seed the database with sample university data, careers, and skills
npm run seed
```

---

### Development Scripts

Run services from the repository root:

```bash
# Start backend API (Port 5000 with nodemon)
npm run dev:backend

# Start frontend development server (Port 5173 with Vite)
npm run dev:frontend

# Run all backend test suites
npm test

# Run interactive smoke test
npm run test:smoke

# Build frontend production bundle
npm run build
```

---

## Production Deployment

### Recommended Stack
- **Backend**: [Render](https://render.com) (Web Service)
- **Frontend**: [Netlify](https://netlify.com) (Static Site with SPA redirects)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed Cluster)

### Environment Configuration

#### Backend (`apps/backend/.env` or Render Dashboard)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/skillbridge?retryWrites=true&w=majority
JWT_SECRET=685cefe7ae7afdba2c9022d98b8afc74ab79fbf4518acef0f7abe6389ab58513
JWT_EXPIRES_IN=7d
CLIENT_URL=https://skillbridge012.netlify.app
API_BASE_URL=https://skillbridge-backend.onrender.com/api/v1
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALLOW_DEV_LOGIN=true
```

#### Frontend (`apps/frontend/.env` or Netlify Dashboard)
```env
VITE_API_URL=https://skillbridge-backend.onrender.com/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Build & Routing Configuration
- **Netlify**: Configured via [`apps/frontend/netlify.toml`](apps/frontend/netlify.toml) and [`apps/frontend/public/_redirects`](apps/frontend/public/_redirects) for single-page routing (`/* /index.html 200`).
- **Render**: Blueprint defined in [`render.yaml`](render.yaml) with automatic health checking on `/api/v1/health`.

For detailed step-by-step setup, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Verification & Testing

The backend includes comprehensive regression test coverage with in-memory MongoDB execution:

```bash
npm test
```

```text
Test Suites: 15 passed, 15 total
Tests:       93 passed, 93 total
Snapshots:   0 total
Time:        74.869 s
Ran all test suites.
```

---

## Demo Personas

The development login sandbox includes pre-configured personas:

- **Student Persona**: `Suraj` (`suraj@adtu.edu.in`) — Senior CS Student, Assam Down Town University.
- **Admin Persona**: `Asif` (`asif@adtu.edu.in`) — Placement Dean, Assam Down Town University.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.