# CareerOS API Contract Specification (`/api/v1`)

> **Notice for Frontend Developers (Person 2 & Person 3):**
> All endpoints documented here define the contract. You can immediately build against these endpoints using mock state/fixtures.

---

## 1. Response Standard

### 1.1 Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### 1.2 Paginated Response
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

### 1.3 Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed on input parameters",
    "details": [
      {
        "field": "email",
        "message": "Valid college email is required"
      }
    ]
  }
}
```

---

## 2. Authentication & Identity (`/auth`)

### `GET /api/v1/auth/me`
Fetches authenticated user identity and role.
- **Headers:** `Authorization: Bearer <token>` or Session Cookie
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65e01f29b4e87a2130e9d101",
      "name": "Alex Chen",
      "email": "alex.chen@apex.edu",
      "role": "STUDENT",
      "organization": {
        "_id": "65e01f29b4e87a2130e9d001",
        "name": "Apex Institute of Technology",
        "slug": "apex-tech"
      },
      "department": {
        "_id": "65e01f29b4e87a2130e9d050",
        "name": "Computer Science & Engineering",
        "code": "CSE"
      },
      "profileImage": "https://lh3.googleusercontent.com/a/sample-photo"
    }
  }
}
```

### `POST /api/v1/auth/logout`
Terminates user session.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Student Profile (`/profile`)

### `GET /api/v1/profile`
Fetches student profile and target career setup.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65e01f29b4e87a2130e9d201",
    "userId": "65e01f29b4e87a2130e9d101",
    "rollNumber": "2023CSE042",
    "graduationYear": 2027,
    "cgpa": 8.45,
    "targetCareer": {
      "_id": "65e01f29b4e87a2130e9d301",
      "title": "Full Stack Developer",
      "slug": "full-stack-developer"
    },
    "skills": [
      {
        "skillId": "65e01f29b4e87a2130e9d401",
        "skillName": "JavaScript",
        "proficiencyLevel": 4,
        "verified": true
      },
      {
        "skillId": "65e01f29b4e87a2130e9d402",
        "skillName": "React",
        "proficiencyLevel": 3,
        "verified": false
      }
    ],
    "interests": ["Web Development", "Cloud Architecture"],
    "preferredRoles": ["Frontend Engineer", "Full Stack Developer"],
    "preferredLocations": ["Bangalore", "Hyderabad", "Remote"]
  }
}
```

### `PUT /api/v1/profile`
Updates academic and personal profile information.
- **Request Body:**
```json
{
  "cgpa": 8.5,
  "graduationYear": 2027,
  "interests": ["Web Development", "Distributed Systems"],
  "preferredLocations": ["Bangalore", "Remote"]
}
```

### `POST /api/v1/profile/skills`
Adds or updates a student skill.
- **Request Body:**
```json
{
  "skillId": "65e01f29b4e87a2130e9d403",
  "proficiencyLevel": 3
}
```

### `PUT /api/v1/profile/target-career`
Sets the active target career for gap analysis.
- **Request Body:**
```json
{
  "careerId": "65e01f29b4e87a2130e9d301"
}
```

---

## 4. Careers & Master Skills (`/careers`, `/skills`)

### `GET /api/v1/careers`
Lists all available career paths.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e01f29b4e87a2130e9d301",
      "title": "Full Stack Developer",
      "slug": "full-stack-developer",
      "category": "Software Engineering",
      "overview": "Designs and builds client-side and server-side web applications.",
      "marketDemand": "VERY_HIGH",
      "averageSalaryRange": { "min": 600000, "max": 1800000, "currency": "INR" }
    }
  ]
}
```

### `GET /api/v1/careers/:id`
Retrieves career details with required skills and weightings.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65e01f29b4e87a2130e9d301",
    "title": "Full Stack Developer",
    "description": "Full Stack engineering specializing in modern JavaScript frameworks and scalable APIs.",
    "requirements": [
      {
        "skillId": "65e01f29b4e87a2130e9d401",
        "skillName": "JavaScript",
        "importance": "Critical",
        "requiredProficiency": 4,
        "weight": 10
      },
      {
        "skillId": "65e01f29b4e87a2130e9d402",
        "skillName": "React",
        "importance": "High",
        "requiredProficiency": 3,
        "weight": 9
      },
      {
        "skillId": "65e01f29b4e87a2130e9d404",
        "skillName": "Docker",
        "importance": "Medium",
        "requiredProficiency": 2,
        "weight": 6
      }
    ]
  }
}
```

### `GET /api/v1/skills`
Lists all standardized skills across categories.
- **Query Params:** `category`, `search`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e01f29b4e87a2130e9d401",
      "name": "JavaScript",
      "category": "Programming",
      "description": "Core ECMAScript fundamentals and async patterns"
    }
  ]
}
```

---

## 5. Career Gap Engine (`/career-analysis`)

### `GET /api/v1/career-analysis`
Computes complete deterministic gap analysis against target career.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "targetCareer": {
      "_id": "65e01f29b4e87a2130e9d301",
      "title": "Full Stack Developer"
    },
    "readinessScore": 71,
    "breakdown": {
      "technicalSkills": 68,
      "assessmentPerformance": 75,
      "projects": 80,
      "resume": 65,
      "interviewPerformance": 70,
      "roadmapProgress": 60
    },
    "matchedSkills": [
      { "name": "JavaScript", "level": 4, "requiredLevel": 4 },
      { "name": "React", "level": 3, "requiredLevel": 3 }
    ],
    "weakSkills": [
      { "name": "Data Structures & Algorithms", "level": 2, "requiredLevel": 4, "gap": 2 }
    ],
    "missingSkills": [
      { "name": "Docker", "importance": "Medium", "requiredLevel": 2 },
      { "name": "System Design", "importance": "High", "requiredLevel": 3 }
    ],
    "prioritySkills": ["Data Structures & Algorithms", "System Design", "Docker"],
    "estimatedWeeksToReady": 8,
    "aiInsights": "Strong JavaScript foundation. Focus on System Design patterns and containerization with Docker."
  }
}
```

---

## 6. Skill Assessments (`/assessments`)

### `GET /api/v1/assessments`
Lists available assessments.
- **Query Params:** `skillId`, `difficulty`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e01f29b4e87a2130e9d501",
      "title": "React Intermediate Assessment",
      "skillName": "React",
      "difficulty": "INTERMEDIATE",
      "durationMinutes": 30,
      "totalQuestions": 10,
      "passingScore": 70
    }
  ]
}
```

### `GET /api/v1/assessments/:id`
Starts assessment session and retrieves questions (without answers).
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attemptId": "65e01f29b4e87a2130e9d599",
    "assessmentId": "65e01f29b4e87a2130e9d501",
    "title": "React Intermediate Assessment",
    "durationMinutes": 30,
    "questions": [
      {
        "questionIndex": 0,
        "questionText": "What does the useEffect hook do when passing an empty dependency array?",
        "options": [
          "Runs on every render",
          "Runs only once after the initial render",
          "Never runs",
          "Runs only before unmounting"
        ]
      }
    ]
  }
}
```

### `POST /api/v1/assessments/:id/submit`
Submits answers and calculates score.
- **Request Body:**
```json
{
  "attemptId": "65e01f29b4e87a2130e9d599",
  "answers": [
    { "questionIndex": 0, "selectedOptionIndex": 1, "timeTakenSeconds": 25 }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "score": 90,
    "passed": true,
    "feedback": "Excellent understanding of React lifecycle and hooks.",
    "skillUpdated": {
      "skillName": "React",
      "newProficiencyLevel": 4,
      "verified": true
    }
  }
}
```

---

## 7. Roadmaps (`/roadmaps`)

### `GET /api/v1/roadmaps/me`
Retrieves student personalized roadmap.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65e01f29b4e87a2130e9d601",
    "targetCareer": "Full Stack Developer",
    "overallProgress": 45,
    "totalMilestones": 8,
    "completedMilestones": 3,
    "milestones": [
      {
        "_id": "65e01f29b4e87a2130e9d610",
        "weekNumber": 1,
        "title": "Advanced Async JavaScript & Event Loop",
        "isCompleted": true,
        "tasks": [
          { "taskId": "t101", "title": "Microtasks and Promises deep dive", "isCompleted": true },
          { "taskId": "t102", "title": "Web Workers and Concurrency", "isCompleted": true }
        ]
      },
      {
        "_id": "65e01f29b4e87a2130e9d611",
        "weekNumber": 2,
        "title": "System Design: Monolith vs Microservices & Caching",
        "isCompleted": false,
        "tasks": [
          { "taskId": "t201", "title": "Redis caching strategies", "isCompleted": false },
          { "taskId": "t202", "title": "Database indexing and sharding", "isCompleted": false }
        ]
      }
    ]
  }
}
```

### `PUT /api/v1/roadmaps/tasks/:taskId/toggle`
Marks a task as completed or incomplete.
- **Request Body:**
```json
{ "isCompleted": true }
```

---

## 8. Projects (`/projects`)

### `GET /api/v1/projects`
Lists student projects.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e01f29b4e87a2130e9d701",
      "title": "Real-Time Collaboration Tool",
      "description": "Engineered a collaborative canvas using WebSockets and Redis Pub/Sub.",
      "technologies": ["Node.js", "React", "Socket.io", "Redis"],
      "githubUrl": "https://github.com/alex/collab-tool",
      "liveUrl": "https://collab-tool.demo.app",
      "evaluationScore": 88
    }
  ]
}
```

### `POST /api/v1/projects`
Creates a new project record.
- **Request Body:**
```json
{
  "title": "E-Commerce Microservices Platform",
  "description": "Built event-driven checkout and order processing service.",
  "technologies": ["Node.js", "Express", "Docker", "RabbitMQ"],
  "githubUrl": "https://github.com/alex/ecommerce-micro",
  "liveUrl": "https://ecommerce.demo.app"
}
```

---

## 9. Resumes (`/resumes`)

### `POST /api/v1/resumes/upload`
Uploads a resume for Gemini parsing and scoring.
- **Request:** `multipart/form-data` with `file`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "resumeId": "65e01f29b4e87a2130e9d801",
    "fileName": "Alex_Chen_Resume.pdf",
    "score": 78,
    "analysis": {
      "extractedSkills": ["JavaScript", "React", "Node.js", "Docker", "MongoDB"],
      "strengths": [
        "Strong quantifiable impact in project bullet points",
        "Clean ATS-friendly formatting"
      ],
      "weaknesses": [
        "Missing cloud deployment metrics (AWS/GCP)",
        "Summary could highlight target role more clearly"
      ],
      "recommendations": [
        "Add numbers showing latency improvement in backend project",
        "Include links to live demos"
      ]
    }
  }
}
```

---

## 10. AI Mock Interviews (`/interviews`)

### `POST /api/v1/interviews`
Creates a new AI interview session.
- **Request Body:**
```json
{
  "targetCareerId": "65e01f29b4e87a2130e9d301",
  "difficulty": "MEDIUM"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "interviewId": "65e01f29b4e87a2130e9d901",
    "status": "IN_PROGRESS",
    "questionNumber": 1,
    "totalQuestions": 5,
    "question": {
      "_id": "65e01f29b4e87a2130e9d911",
      "questionText": "Can you explain how the Node.js event loop handles asynchronous I/O and where microtasks fit in?",
      "skillTested": "Node.js"
    }
  }
}
```

### `POST /api/v1/interviews/:id/answer`
Submits student's voice/text answer and receives AI critique + next question.
- **Request Body:**
```json
{
  "questionId": "65e01f29b4e87a2130e9d911",
  "studentAnswer": "The event loop has phases like timers, poll, and check. Microtasks like process.nextTick and Promise callbacks run between phases."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluation": {
      "score": 85,
      "feedback": "Accurate explanation of phase transitions and microtask execution queues."
    },
    "isCompleted": false,
    "nextQuestion": {
      "_id": "65e01f29b4e87a2130e9d912",
      "questionText": "How would you design an idempotency mechanism for payment endpoints?",
      "skillTested": "System Design"
    }
  }
}
```

---

## 11. Jobs & Applications (`/jobs`, `/applications`)

### `GET /api/v1/jobs`
Fetches matching campus and platform jobs with student match score.
- **Query Params:** `search`, `jobType`, `minMatchScore`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e01f29b4e87a2130e9e001",
      "title": "Software Engineer - Full Stack",
      "company": "Tech Corp",
      "location": "Bangalore (Hybrid)",
      "jobType": "FULL_TIME",
      "salaryRange": { "min": 1000000, "max": 1400000, "currency": "INR" },
      "matchScore": 86,
      "matchedSkills": ["JavaScript", "React", "Node.js"],
      "missingSkills": ["Docker"],
      "applicationDeadline": "2026-10-15T00:00:00.000Z"
    }
  ]
}
```

### `POST /api/v1/jobs/:id/apply`
Applies to a job.
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "65e01f29b4e87a2130e9e101",
    "status": "APPLIED",
    "appliedAt": "2026-08-25T13:30:00.000Z"
  }
}
```

---

## 12. Student Dashboard Aggregation (`/dashboard/student`)

### `GET /api/v1/dashboard/student`
Single aggregated query returning all essential metrics for the student dashboard.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "readinessScore": 72,
    "skillProgress": 68,
    "roadmapProgress": 54,
    "projectsCount": 3,
    "interviewsCompleted": 4,
    "activeJobMatches": 12,
    "targetCareer": {
      "id": "65e01f29b4e87a2130e9d301",
      "title": "Full Stack Developer"
    },
    "scoreBreakdown": {
      "technicalSkills": 75,
      "assessmentPerformance": 80,
      "projects": 70,
      "resume": 65,
      "interviewPerformance": 70,
      "roadmapProgress": 54
    },
    "topSkillGaps": [
      { "name": "System Design", "gap": 2 },
      { "name": "Docker", "gap": 1 }
    ],
    "recentActivity": [
      {
        "type": "ASSESSMENT_COMPLETED",
        "title": "React Intermediate Assessment",
        "score": 90,
        "date": "2026-08-24T14:20:00.000Z"
      }
    ]
  }
}
```

---

## 13. College Admin Dashboard & Analytics (`/dashboard/admin`, `/admin/*`)

### `GET /api/v1/dashboard/admin`
College administrator overview metrics scoped strictly to admin's organization.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 1248,
    "placementReadyCount": 786,
    "placementReadyPercentage": 63,
    "averageReadinessScore": 71,
    "activeJobMatches": 482,
    "departmentBreakdown": [
      { "department": "CSE", "students": 450, "avgReadiness": 76 },
      { "department": "ECE", "students": 380, "avgReadiness": 68 },
      { "department": "IT", "students": 418, "avgReadiness": 72 }
    ],
    "topSkillGaps": [
      { "skillName": "DSA", "affectedPercentage": 42 },
      { "skillName": "System Design", "affectedPercentage": 37 },
      { "skillName": "Cloud", "affectedPercentage": 31 },
      { "skillName": "Communication", "affectedPercentage": 28 }
    ],
    "readinessDistribution": {
      "ready90Plus": 15,
      "ready75To89": 48,
      "ready60To74": 25,
      "below60": 12
    }
  }
}
```

### `GET /api/v1/admin/students`
Lists students in organization with search, department filtering, and pagination.
- **Query Params:** `page`, `limit`, `departmentId`, `search`, `minReadiness`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "65e01f29b4e87a2130e9d101",
      "name": "Alex Chen",
      "email": "alex.chen@apex.edu",
      "rollNumber": "2023CSE042",
      "department": "CSE",
      "graduationYear": 2027,
      "targetCareer": "Full Stack Developer",
      "readinessScore": 72,
      "status": "IN_PROGRESS"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "totalPages": 23
  }
}
```

### `GET /api/v1/admin/departments`
Lists departments for the organization.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e01f29b4e87a2130e9d050",
      "name": "Computer Science & Engineering",
      "code": "CSE",
      "headOfDepartment": "Dr. Sarah Jenkins",
      "studentCount": 450
    }
  ]
}
```
