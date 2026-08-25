# CareerOS

> AI-Powered Career & Placement Readiness Operating System for Colleges and Students.

---

## 🎯 Overview

CareerOS bridges the gap between college education and placement readiness by continuously evaluating student profiles, target careers, missing skills, roadmaps, project portfolios, resume quality, and AI mock interview performance.

---

## 🏗️ Monorepo Architecture

```text
careeros/
├── apps/
│   ├── backend/             # Express.js REST API, Mongoose, Gemini AI
│   └── frontend/            # React + Vite (Student & Admin Experience)
├── docs/
│   ├── openapi.yaml         # OpenAPI 3.0 API Specification
│   ├── API_CONTRACT.md      # Detailed REST API endpoints and mock contracts
│   ├── ARCHITECTURE.md      # High-level architecture and data flows
│   └── DATABASE.md          # MongoDB schema documentation and relationships
├── SPEC.md                  # Comprehensive product specification
└── package.json             # Root workspace configuration
```

---

## 👥 Team Ownership & Branches

| Person | Role | Branch | Owned Directory |
| :--- | :--- | :--- | :--- |
| **Person 1** | Backend & Core Platform | `backend/core` | `apps/backend/`, `docs/openapi.yaml`, `docs/API_CONTRACT.md`, `docs/DATABASE.md` |
| **Person 2** | Student Frontend | `frontend/student` | `apps/frontend/src/features/student/` |
| **Person 3** | Admin & Analytics Frontend | `frontend/admin` | `apps/frontend/src/features/admin/` |

---

## 🚀 Quickstart

### Prerequisites
- Node.js >= 18.x
- MongoDB instance (Local or Atlas)
- Google Cloud OAuth Credentials
- Google Gemini API Key

### Backend Setup
```bash
cd apps/backend
cp .env.example .env
npm install
npm run dev
```

### Running Tests
```bash
npm run backend:test
```

---

## 📜 API Documentation & Contracts
- **Swagger / OpenAPI 3.0**: [docs/openapi.yaml](docs/openapi.yaml)
- **API Contracts & Mock JSON**: [docs/API_CONTRACT.md](docs/API_CONTRACT.md)
- **Database Model Schemas**: [docs/DATABASE.md](docs/DATABASE.md)
