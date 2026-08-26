# CareerOS — Project Specification

## 1. Project Overview

**Project Name:** CareerOS

**Type:** AI-powered career and placement readiness SaaS

**Primary Users:**

* Students
* College/Placement Administrators
* Super Administrators

**Technology Stack:**

* Frontend: React + Vite
* Backend: Node.js + Express.js
* Database: MongoDB + Mongoose
* Authentication: Google OAuth 2.0 / OpenID Connect
* AI: Google Gemini API
* API Style: REST
* Version Control: Git + GitHub

---

# 2. Product Vision

CareerOS is a career and placement operating system for college students.

Instead of simply recommending careers, CareerOS continuously evaluates:

```text
Student Profile
      ↓
Current Skills
      ↓
Target Career
      ↓
Skill Gap Analysis
      ↓
Personalized Roadmap
      ↓
Projects + Assessments
      ↓
AI Mock Interviews
      ↓
Resume Analysis
      ↓
Placement Readiness
      ↓
Job Matching
```

The platform should eventually support multiple colleges and organizations.

---

# 3. Core Problem

Students often do not know:

* Which career is appropriate for them
* Which skills they are missing
* Whether they are actually placement-ready
* What projects they should build
* How good their resume is
* How they perform in interviews
* Which jobs match their current skills

Colleges often do not know:

* Which students are placement-ready
* Which skills are missing across departments
* Which students require additional training
* How students perform in assessments/interviews
* Which roles students are prepared for

CareerOS solves both sides.

---

# 4. Main Product Modules

## Student

```text
Authentication
Profile
Career Selection
Skill Assessment
Career Gap Analysis
Personalized Roadmap
Projects
Resume
AI Interview
Jobs
Applications
Notifications
Dashboard
```

## College Admin

```text
Dashboard
Students
Departments
Skills
Assessments
Interviews
Jobs
Analytics
Reports
Settings
```

## Super Admin

```text
Organizations
Users
Careers
Skills
Career Requirements
Jobs
Platform Analytics
System Configuration
```

---

# 5. User Roles

## STUDENT

Permissions:

* Read/update own profile
* Manage own skills
* Select target career
* Take assessments
* View assessment history
* View career analysis
* Manage roadmap
* Manage projects
* Upload/manage resume
* Take AI interviews
* View interview history
* View recommended jobs
* Apply to jobs
* View own dashboard

Students must never access another student's private information.

---

## COLLEGE_ADMIN

Permissions:

* View students belonging to their organization
* View department information
* View organization-level analytics
* View placement readiness
* View skill gaps
* View assessment analytics
* View interview analytics
* Manage organization-level placement data
* Manage organization-specific jobs

A college admin must never access another organization's data.

---

## SUPER_ADMIN

Permissions:

* Manage organizations
* Manage users
* Manage careers
* Manage skills
* Manage career requirements
* Manage platform-level jobs
* View system analytics
* Manage platform configuration

---

# 6. Multi-Tenant Architecture

CareerOS must support multiple colleges.

Example:

```text
CareerOS
│
├── College A
│   ├── CSE
│   ├── ECE
│   └── Students
│
├── College B
│   ├── CSE
│   ├── Mechanical
│   └── Students
│
└── College C
    ├── IT
    └── Students
```

Every organization-owned resource must be scoped to its organization.

The backend must enforce organization isolation.

Never trust an organization ID supplied by the frontend.

---

# 7. Repository Architecture

Use a monorepo:

```text
careeros/
│
├── apps/
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── validators/
│   │   │   ├── utils/
│   │   │   ├── integrations/
│   │   │   │   ├── gemini/
│   │   │   │   └── google/
│   │   │   ├── app.js
│   │   │   └── server.js
│   │   │
│   │   ├── tests/
│   │   ├── scripts/
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   ├── api/
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── features/
│       │   │   ├── student/
│       │   │   └── admin/
│       │   ├── hooks/
│       │   ├── context/
│       │   ├── routes/
│       │   ├── utils/
│       │   └── main.jsx
│       └── package.json
│
├── docs/
│   ├── openapi.yaml
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   └── DATABASE.md
│
├── SPEC.md
├── README.md
├── package.json
└── .gitignore
```

---

# 8. Three-Person Git Ownership

The project is developed by three people in parallel.

## Person 1 — Backend + AI

Branch:

```text
backend/core
```

Owns:

```text
apps/backend/
docs/openapi.yaml
docs/API_CONTRACT.md
docs/DATABASE.md
```

Responsibilities:

* Express
* MongoDB
* Mongoose
* Authentication
* Authorization
* Career engine
* Assessments
* Roadmaps
* Resume APIs
* AI/Gemini
* Interviews
* Jobs
* Analytics APIs
* Testing
* API documentation

---

## Person 2 — Student Frontend

Branch:

```text
frontend/student
```

Owns:

```text
apps/frontend/src/features/student/
```

Responsibilities:

* Student login experience
* Student dashboard
* Profile
* Career selection
* Career analysis
* Assessments
* Roadmap
* Projects
* Resume
* AI interview
* Jobs
* Applications

---

## Person 3 — Admin Frontend

Branch:

```text
frontend/admin
```

Owns:

```text
apps/frontend/src/features/admin/
```

Responsibilities:

* College dashboard
* Student management
* Department management
* Skill analytics
* Assessment analytics
* Interview analytics
* Placement readiness
* Job management
* Reports

---

# 9. Git Rules

Never directly develop on `main`.

Recommended:

```text
main
  │
  └── develop
       ├── backend/core
       ├── frontend/student
       └── frontend/admin
```

Each developer creates Pull Requests into `develop`.

After integration testing:

```text
develop → main
```

Keep commits small and focused.

Do not modify another developer's owned directory without coordination.

---

# 10. Backend Architecture

Use:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
MongoDB
```

Controllers should be thin.

Routes should contain routing definitions only.

Business logic belongs in services.

Database logic should be centralized and reusable.

---

# 11. API Versioning

All APIs must use:

```text
/api/v1
```

Examples:

```text
GET    /api/v1/me
GET    /api/v1/careers
GET    /api/v1/careers/:id
POST   /api/v1/career-analysis
GET    /api/v1/roadmaps/me
GET    /api/v1/jobs
GET    /api/v1/dashboard/student
GET    /api/v1/dashboard/admin
```

---

# 12. API Response Format

All API responses include a correlation identifier header: `X-Request-ID` (generated or caller-supplied), exposed via CORS for frontend/client tracing.

## Success

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

## Paginated

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

Error envelopes must never leak raw internal stack traces in production (stack traces are logged in development server logs only).

---

# 13. Authentication

Support Google OAuth 2.0 / OpenID Connect.

Flow:

```text
Student
   ↓
Google Login
   ↓
Google Identity Verification
   ↓
Find/Create User
   ↓
Application Session
   ↓
Authenticated API Requests
```

Required functionality:

```text
/login
/callback
/me
/logout
```

Authentication logic must be centralized.

---

# 14. Authorization

Use role-based authorization.

Example:

```text
STUDENT
COLLEGE_ADMIN
SUPER_ADMIN
```

Middleware should support:

```text
requireAuth()
requireRole()
requireOrganizationAccess()
```

Authorization must always be enforced on the backend.

Frontend route protection is not sufficient.

---

# 15. Database Collections

Initial collections:

```text
users
organizations
departments
studentProfiles
skills
careers
careerRequirements
assessments
assessmentAttempts
roadmaps
roadmapItems
projects
resumes
interviews
interviewQuestions
interviewAnswers
jobs
jobApplications
notifications
aiGenerations
```

Collections can be introduced gradually.

Do not create unnecessary collections.

---

# 16. User Model

Conceptually:

```text
User
├── name
├── email
├── googleId
├── role
├── organizationId
├── departmentId
├── profileImage
├── isActive
├── createdAt
└── updatedAt
```

Sensitive authentication information must never be exposed in API responses.

---

# 17. Student Profile

Conceptually:

```text
StudentProfile
├── userId
├── organizationId
├── departmentId
├── education
├── cgpa
├── graduationYear
├── skills
├── interests
├── preferredRoles
├── preferredLocations
├── experience
└── targetCareerId (explicitly selected via PUT /api/v1/profile/target-career; not auto-assigned on profile creation)
```

---

# 18. Skills

Skills should support:

```text
name
category
description
proficiencyLevels
```

Example categories:

```text
Programming
Frontend
Backend
Database
DevOps
Cloud
AI/ML
Data
Cybersecurity
Soft Skills
```

---

# 19. Careers

Example careers:

```text
Full Stack Developer
Frontend Developer
Backend Developer
Data Analyst
Data Scientist
Machine Learning Engineer
DevOps Engineer
Cybersecurity Analyst
UI/UX Designer
Product Manager
```

Each career should have associated requirements.

---

# 20. Career Requirements

Each career requirement should support:

```text
careerId
skillId
importance
requiredProficiency
weight
```

Example:

```text
Full Stack Developer

JavaScript
Importance: High
Weight: 10

React
Importance: High
Weight: 9

Node.js
Importance: High
Weight: 9

Docker
Importance: Medium
Weight: 6
```

---

# 21. Career Gap Engine

This is a core CareerOS feature.

Input:

```text
Student Profile
Current Skills
Target Career (Required: GET /api/v1/career-analysis returns 400 if no target career is selected)
Career Requirements
Assessment Results (uses latest completed attempt per required skill)
Projects
```

Output:

```text
readinessScore
matchedSkills
weakSkills
missingSkills
prioritySkills
recommendedProjects
recommendedLearning
estimatedPreparationTime
```

Example:

```json
{
  "readinessScore": 71,
  "matchedSkills": [
    "JavaScript",
    "React",
    "Node.js"
  ],
  "weakSkills": [
    "DSA"
  ],
  "missingSkills": [
    "Docker",
    "AWS",
    "System Design"
  ],
  "prioritySkills": [
    "DSA",
    "System Design",
    "Docker"
  ]
}
```

The initial readiness score must be deterministic.

- Assessment readiness uses the latest completed attempt for each required skill, ensuring retake volume does not distort scores.
- Duplicate student skill records resolve deterministically to the highest recorded proficiency.
- `GET /api/v1/career-analysis` returns `400 Bad Request` until an active target career is explicitly configured.

AI should enhance recommendations and explanations rather than being the sole source of truth.

---

# 22. Placement Readiness Score

Authoritative 6-pillar canonical weight distribution:

```text
Technical Skills        30%
Assessment Performance  20%
Projects                15%
Resume                  10%
Interview Performance   15%
Roadmap Progress        10%
```

Rules for readiness calculation:
- Organization-specific custom weights are dynamically merged with canonical defaults and normalized to 100% prior to calculating composite scores.
- The backend calculates the authoritative score; frontend never computes or overrides business readiness metrics.

---

# 23. Assessments

Assessment system must support:

* assessment creation
* questions
* multiple question types
* answer submission
* attempt tracking
* scoring
* skill mapping
* result history

Students must not be able to modify completed attempts.

---

# 24. Personalized Roadmap

A roadmap belongs to:

```text
Student
Target Career
Skill Gaps
```

Roadmap contains:

```text
Milestones
Tasks
Skills
Resources
Projects
Estimated Duration
Progress
```

Example:

```text
Week 1
JavaScript Advanced

Week 2
DSA Arrays

Week 3
DSA Trees

Week 4
Advanced React

Week 5
Node.js Architecture
```

Students can mark tasks complete.

---

# 25. Project Portfolio

Students can create projects containing:

```text
title
description
technologies
skills
githubUrl
liveUrl
role
duration
```

Projects contribute to placement readiness.

---

# 26. Resume System

Support:

* resume metadata
* resume upload
* resume status
* resume analysis
* extracted skills
* improvement suggestions

Future storage should be replaceable with cloud storage.

Do not expose server filesystem paths.

---

# 27. Gemini AI Architecture

Gemini must be isolated behind a service layer.

Recommended:

```text
integrations/
└── gemini/
    ├── client.js
    ├── gemini.service.js
    ├── prompts/
    └── schemas/
```

Never call Gemini directly from React.

Never expose Gemini API keys to the frontend.

---

# 28. AI Features

Initial AI capabilities:

### Career Analysis

Analyze:

```text
student profile
skills
target career
assessment results
```

Return:

```text
strengths
weaknesses
skill gaps
recommendations
```

### Roadmap Generation

Generate a personalized roadmap based on the career gap.

### Resume Analysis

Evaluate:

```text
skills
structure
clarity
missing information
role alignment
```

### Project Recommendations

Recommend projects based on:

```text
target role
missing skills
current skill level
```

### AI Interview

Generate and evaluate interview questions.

---

# 29. AI Safety & Reliability

AI output is untrusted generated content.

Requirements:

* validate structured AI output
* handle malformed responses
* use timeouts
* retry safely
* rate-limit expensive requests
* limit input/output sizes
* never expose secrets
* log generation metadata without storing unnecessary sensitive content

Numeric readiness scores should remain backend-controlled.

---

# 30. AI Interview System

Flow:

```text
Create Interview
      ↓
Select Career
      ↓
Select Difficulty
      ↓
Generate Question
      ↓
Student Answers
      ↓
AI Evaluation
      ↓
Next Question
      ↓
Final Report
```

Evaluation can include:

```text
Technical Correctness
Problem Solving
Communication
Clarity
Confidence
Relevance
```

Final output:

```text
Overall Score
Strengths
Weaknesses
Recommended Improvements
```

---

# 31. Jobs

Jobs should contain:

```text
title
company
location
description
requiredSkills
preferredSkills
experience
salaryRange
applicationUrl
deadline
organizationId
allowedDepartments
allowedGraduationYears
minCgpa
```

Students can:

```text
view
filter
match
save
apply
```

Application Eligibility Rules:
- Applications to expired jobs (past `deadline`) are rejected with `400 Bad Request`.
- Candidate eligibility checks student profile `cgpa` (authoritative schema field) against `job.minCgpa`.
- Department (`user.departmentId` / `profile.departmentId`) and `graduationYear` are validated against job criteria when configured.

---

# 32. Job Matching

Initial matching should be deterministic.

Compare:

```text
Student Skills
       VS
Job Required Skills
```

Calculate:

```text
matchScore
matchedSkills
missingSkills
eligibility
```

AI may provide an explanation.

Example:

```text
Match: 82%

Strong Matches:
✓ React
✓ Node.js
✓ MongoDB

Missing:
⚠ Docker

Recommendation:
Apply after completing Docker fundamentals.
```

---

# 33. Student Dashboard

The backend should provide a dashboard aggregation endpoint.

Example:

```text
GET /api/v1/dashboard/student
```

Return:

```text
readinessScore
skillProgress
roadmapProgress
projectCount
interviewCount
jobMatches
assessmentPerformance
recentActivity
skillGaps
```

Avoid forcing the frontend to make many independent requests.

---

# 34. College Admin Dashboard

Example:

```text
GET /api/v1/dashboard/admin
```

Return:

```text
totalStudents
averageReadiness
placementReadyPercentage
departmentBreakdown
commonSkillGaps
assessmentPerformance
interviewPerformance
readinessDistribution
```

All information must be scoped to the admin's organization.

---

# 35. Analytics

College analytics should support:

```text
Readiness distribution
Department comparison
Skill-gap frequency
Assessment performance
Interview performance
Roadmap progress
Career demand
Job matching
```

Optimize aggregation queries.

Use MongoDB indexes where necessary.

---

# 36. Notifications

Future-ready notification system:

```text
roadmap reminder
assessment result
interview result
new job
application update
admin announcement
```

Notifications belong to a specific user or organization.

---

# 37. Validation

Validate:

* request body
* query parameters
* route parameters
* uploaded files
* URLs
* IDs
* pagination parameters

Reject malformed requests before business logic.

---

# 38. Security, Observability & Lifecycle

Required:

* secure HTTP headers & CORS
* request correlation via `X-Request-ID` (generated UUID or caller-supplied, returned in response headers and CORS-exposed)
* structured request/response logging (method, path, status, duration, actor context)
* sensitive metadata redaction (passwords, secrets, tokens, cookies, auth headers)
* request size limits & rate limiting
* input validation with Zod
* secure authentication (Google Identity Services / session cookies / JWT versioning)
* role-based authorization (STUDENT, COLLEGE_ADMIN, SUPER_ADMIN)
* organization data isolation
* safe MongoDB queries & ReDoS sanitization
* secure file validation & direct PDF parser extraction
* environment-based secrets management
* standardized error handling (no leaked internal stack traces in production)
* guarded graceful server shutdown (closing HTTP connections, disconnecting MongoDB with 10s safety timeout)

Never expose:

```text
passwords
password hashes
OAuth secrets
Gemini API keys
JWT secrets
internal filesystem paths
stack traces in production
```

---

# 39. Environment Variables

Use:

```text
NODE_ENV
PORT
MONGO_URI
CLIENT_URL
API_BASE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
GEMINI_API_KEY
SESSION_SECRET
```

Actual secrets must never be committed.

Only `.env.example` belongs in Git.

---

# 40. API Modules

Planned API groups:

```text
/auth
/users
/me
/organizations
/departments
/careers
/skills
/assessments
/roadmaps
/projects
/resumes
/interviews
/jobs
/applications
/dashboard
/analytics
/ai
/notifications
/admin
```

---

# 41. Development Phases

## Phase 0 — Repository Foundation

Implement:

* monorepo
* Git structure
* README
* environment templates
* documentation
* API contract
* OpenAPI foundation

---

## Phase 1 — Backend Foundation

Implement:

* Express
* MongoDB
* Mongoose
* configuration
* error handling
* logging
* security middleware
* validation foundation
* health endpoint

---

## Phase 2 — Authentication

Implement:

* Google OAuth/OIDC
* user creation
* login
* logout
* `/me`
* authentication middleware
* roles
* organization authorization

---

## Phase 3 — Profiles & Organizations

Implement:

* organizations
* departments
* student profiles
* profile APIs
* organization isolation

---

## Phase 4 — Careers & Skills

Implement:

* skills
* careers
* career requirements
* career-skill mappings
* seed data

---

## Phase 5 — Assessments

Implement:

* assessments
* questions
* attempts
* scoring
* skill evaluation

---

## Phase 6 — Career Gap Engine

Implement:

* target career
* skill gap analysis
* readiness score
* priority skills
* recommendations

---

## Phase 7 — Gemini AI

Implement:

* Gemini service
* career analysis
* roadmap generation
* resume analysis
* project recommendations

---

## Phase 8 — Roadmaps

Implement:

* roadmap generation
* milestones
* tasks
* progress
* completion

---

## Phase 9 — Projects

Implement:

* project CRUD
* skills
* GitHub/live URLs
* recommendations

---

## Phase 10 — Resume

Implement:

* upload
* metadata
* analysis
* improvement recommendations

---

## Phase 11 — AI Interview

Implement:

* sessions
* questions
* answers
* evaluation
* scoring
* final report
* history

---

## Phase 12 — Jobs

Implement:

* jobs
* skills
* matching
* applications
* filtering
* pagination

---

## Phase 13 — Student Dashboard

Implement:

* readiness
* skills
* roadmap
* assessments
* interviews
* projects
* jobs

---

## Phase 14 — College Analytics

Implement:

* organization analytics
* department analytics
* skill gaps
* readiness
* assessment analytics
* interview analytics

---

# 42. Frontend Development & Design System

The frontend is built with React 18 + Vite (dev server running on port `5173`) and consumes backend endpoints through documented REST APIs.

### Visual Design System
- **Apple-Inspired Aesthetic**: Bright neutral surfaces (`#F5F5F7` background, `#FFFFFF` cards), graphite typography and controls (`#1D1D1F`), crisp dividers (`#E5E5EA`), and restrained emerald feedback (`#059669`).
- **No AI Visual Tropes**: Strictly no dark-blue/purple glowing gradients, rainbow badges, or floating magic wands. AI insights are formatted as clear analytical diagnostic reports.

### Shell & Layout Architecture
- `apps/frontend/src/components/common/AppShell.jsx` serves as the sole responsive shell for both Student and Admin workspaces.
  - Role-specific sidebar and mobile navigation drawer.
  - Account identity pill and session logout.
- `StudentLayout.jsx` and `AdminLayout.jsx` are thin wrappers providing context to `AppShell`.
- `LoginPage.jsx` provides clean Google Identity Services (GSI) OAuth, email authentication, and 1-click sandbox demo persona logins.

Student frontend:

```text
features/student/
```

Admin frontend:

```text
features/admin/
```

Shared:

```text
api/
components/ (including common/AppShell.jsx)
layouts/
app/
```

Frontend must not duplicate backend business logic.

---

# 43. Frontend API Strategy

Use a centralized API client.

Example:

```text
api/
├── client.js
├── auth.js
├── student.js
├── careers.js
├── assessments.js
├── roadmap.js
├── interviews.js
├── jobs.js
└── admin.js
```

Do not make raw `fetch()` calls throughout individual components.

---

# 44. Definition of Done

A module is complete only when:

* Model/schema exists where required
* API exists
* Validation exists
* Authorization exists
* Error handling exists
* API documentation exists
* Tests exist for important behavior
* Seed data exists where useful
* No secrets are committed
* Existing functionality remains working

---

# 45. Antigravity Rules

When working on CareerOS:

1. Read SPEC.md before making changes.
2. Inspect the repository before coding.
3. Search for existing implementations before creating new ones.
4. Reuse existing utilities.
5. Do not rewrite working modules unnecessarily.
6. Do not modify another developer's ownership area.
7. Do not invent undocumented APIs.
8. Update API documentation whenever an API changes.
9. Keep controllers thin.
10. Keep business logic in services.
11. Keep secrets in environment variables.
12. Do not add dependencies without justification.
13. Do not create fake credentials.
14. Keep commits focused.
15. Preserve backward compatibility where practical.
16. Report assumptions when requirements are ambiguous.

---

# 46. Backend Developer Rule

Person 1 owns:

```text
apps/backend/
```

Person 1 must provide stable contracts for:

```text
Person 2 → Student Frontend
Person 3 → Admin Frontend
```

Frontend developers should be able to use mock data based entirely on:

```text
docs/openapi.yaml
docs/API_CONTRACT.md
```

---

# 47. Frontend Developer Rule

Person 2 and Person 3 must not modify backend implementation.

If an API is missing:

1. Check API_CONTRACT.md.
2. Check OpenAPI.
3. Use mock data temporarily if necessary.
4. Report the missing endpoint to Person 1.

Do not invent a different backend contract.

---

# 48. Shared File Rules

Treat these as protected/shared:

```text
SPEC.md
README.md
docs/openapi.yaml
docs/API_CONTRACT.md
apps/frontend/src/app/
apps/frontend/src/api/
apps/frontend/src/components/
package.json
```

Avoid unnecessary changes.

---

# 49. Future Expansion

CareerOS should be architected so future versions can add:

```text
Mobile App
Company Recruiter Portal
College Placement Cell
Skill Certification
Coding Assessments
GitHub Integration
LinkedIn Integration
Job Board Integrations
Learning Platform Integrations
AI Career Mentor
AI Resume Builder
AI Portfolio Builder
Placement Prediction
Employer Candidate Search
Institution Benchmarking
```

These are not required for the initial MVP.

---

# 50. MVP Definition

The first business-demo-ready version should include:

```text
✓ Google Login
✓ Student Profile
✓ Career Selection
✓ Skills
✓ Career Requirements
✓ Skill Gap Analysis
✓ Placement Readiness Score
✓ Personalized Roadmap
✓ Projects
✓ Resume Analysis
✓ AI Mock Interview
✓ Job Matching
✓ Student Dashboard
✓ College Admin Dashboard
✓ Skill Gap Analytics
✓ Organization Isolation
```

The MVP should demonstrate a complete journey:

```text
Student Logs In
      ↓
Creates Profile
      ↓
Selects "Full Stack Developer"
      ↓
CareerOS Analyzes Skills
      ↓
Shows 71% Readiness
      ↓
Identifies Skill Gaps
      ↓
Generates Roadmap
      ↓
Student Completes Skills/Projects
      ↓
AI Interview
      ↓
Resume Analysis
      ↓
Readiness Score Improves
      ↓
Matched Jobs Appear
```

This complete loop is the central product experience of CareerOS.
