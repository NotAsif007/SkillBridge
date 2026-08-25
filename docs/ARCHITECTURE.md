# CareerOS Architecture & Security Guide

## 1. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React + Vite (SPA)                   │
│   (Person 2: /features/student  | Person 3: /admin)    │
└───────────────────────────┬────────────────────────────┘
                            │ REST JSON (/api/v1)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Express.js Application Layer             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Security: Helmet, CORS, Rate Limit, Size Guards  │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             ▼                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middlewares: requireAuth, requireRole, orgScope  │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             ▼                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Controllers (Thin orchestration layer)           │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             ▼                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Services (Pure domain business logic)            │  │
│  └───────┬───────────────────────────────┬──────────┘  │
│          │                               │             │
│          ▼                               ▼             │
│   ┌───────────────┐              ┌─────────────────┐   │
│   │ Mongoose/DB   │              │ Gemini AI Layer │   │
│   └──────┬────────┘              └────────┬────────┘   │
└──────────┼────────────────────────────────┼────────────┘
           ▼                                ▼
     MongoDB Cluster                 Google Gemini API
```

---

## 2. Layer Responsibilities

1. **Routes**: Exclusively route registration, middleware wiring, and input validator binding.
2. **Controllers**: Parse query/body/params, invoke services, return standardized envelopes (`{ success: true, data }`).
3. **Services**: Pure business rules, deterministic scoring algorithms, Gemini AI orchestration, and multi-tenant scoping.
4. **Models / Mongoose**: Schema validation, indexes, virtuals, and entity hooks.

---

## 3. Multi-Tenant Organization Isolation

- Every organization-specific entity carries `organizationId`.
- Authentication middleware injects `req.user` with `req.user.organizationId` and `req.user.role`.
- `organizationScope.middleware.js` automatically binds tenant boundaries.
- College Admin cannot query students outside their `organizationId`.
- Student cannot query or update any private document belonging to another student.

---

## 4. Deterministic + AI Hybrid Engine Pattern

```text
Student Skills + Target Career Requirements
                 ↓
Deterministic Career Gap Engine (Score: 0-100%, Matched/Weak/Missing)
                 ↓
Gemini AI Layer (Synthesizes contextual explanations, tailored roadmaps & interview critiques)
                 ↓
Authoritative Response to Client
```
The numeric readiness score is computed deterministically by the backend algorithms. Gemini AI enhances qualitative reasoning, personalized guidance, and dynamic question generation.
