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
  - Dynamically asks follow-up technical questions based on prior candidate answers.
  - Evaluates technical accuracy, depth, and communication, delivering an instant diagnostic rubric report.

- **📝 Secure Skill Assessments**:
  - Timed assessments across programming languages, system design, and frameworks.
  - Anti-cheat architecture ensuring **zero answer-key leaks** to the client before submission.
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
  - Live recruitment drive tracking across all hiring stages: `Applied` &rarr; `Under Review` &rarr; `Shortlisted` &rarr; `Interview Scheduled` &rarr; `Offered`.

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
- **ReDoS Protection**: Regular expression sanitization across all search and query parameters.
- **AI Fault-Tolerance**: Automatic fallback mechanism with degraded status metadata (`{ source: 'AI' | 'FALLBACK' }`) ensuring zero downtime during API rate limits.
- **Apple-Inspired Design System**: Light neutral presentation (#F5F5F7 surfaces, #1D1D1F graphite, #E5E5EA dividers, emerald feedback) with a unified `AppShell` for student and admin layouts.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6 |
| **Backend** | Node.js, Express, MongoDB Atlas, Mongoose ODM, Multer, PDF-Parse, JWT, Helmet, Morgan |
| **AI & LLM** | Google GenAI SDK (`@google/genai`), Google Gemini 3.5 Flash |
| **Testing** | Jest (ES Modules), Supertest, MongoDB Memory Server |

---

## 📂 Project Structure

```text
careeros/
├── apps/
│   ├── backend/                 # Node.js + Express REST API & AI Engines
│   │   ├── src/
│   │   │   ├── config/          # Environment & database configuration
│   │   │   ├── controllers/     # Express route controllers
│   │   │   ├── integrations/    # Google Gemini AI & Google OAuth clients
│   │   │   ├── middleware/      # Auth, CORS, rate limiting, error handlers, correlation
│   │   │   ├── models/          # Mongoose multi-tenant schemas
│   │   │   ├── routes/          # REST API endpoints
│   │   │   ├── services/        # Business logic & gap analysis engines
│   │   │   ├── utils/           # Response envelopes, errors, logger, regex sanitizers
│   │   │   └── validators/      # Zod request validation schemas
│   │   ├── scripts/             # Database seeders & live smoke test runners
│   │   └── tests/               # 15 Jest automated test suites (93 tests)
│   │
│   └── frontend/                # React 18 + Vite Single Page Application
│       └── src/
│           ├── api/             # Axios API client & endpoints
│           ├── app/             # Router & context providers
│           ├── components/      # Common UI components, AppShell, route guards, charts
│           │   └── common/      # AppShell.jsx, Navbar, Sidebar
│           ├── context/         # AuthContext session management
│           ├── features/
│           │   ├── student/     # Student portal pages (Dashboard, Resume, Roadmap, etc.)
│           │   └── admin/       # College admin pages (Analytics, Rosters, Departments)
│           ├── layouts/         # StudentLayout & AdminLayout (thin AppShell wrappers)
│           └── pages/           # Institutional Splash & Login Portal (Apple-inspired)
│
├── docs/                        # Specifications, Database Schemas, API Contracts, Design
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DESIGN.md
│   └── openapi.yaml
│
├── CONTEXT.md                   # Current state, architecture decisions & handoff context
└── SPEC.md                      # Complete system specifications
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local MongoDB or MongoDB Atlas URI
- **Google Cloud Console**: OAuth 2.0 Web Client ID
- **Google AI Studio**: Gemini API Key

---

### 1. Backend Setup

```bash
cd apps/backend

# Install dependencies
npm install

# Configure environment variables
# (Edit .env with your MONGO_URI, GEMINI_API_KEY, and GOOGLE_CLIENT_ID)
cp .env.example .env

# Run database seeder (seeds demo college, skills, careers, students)
npm run seed

# Start development server (port 5000)
npm run dev
```

---

### 2. Frontend Setup

```bash
cd apps/frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start frontend dev server (port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

### 3. Running Automated Tests

```bash
# Run complete backend test suite (15 suites, 93 tests)
cd apps/backend
npm test

# Run interactive smoke test with in-memory MongoDB
npm run test:smoke

# Run frontend production build
cd apps/frontend
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