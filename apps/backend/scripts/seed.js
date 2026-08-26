import mongoose from 'mongoose';
import { config } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';
import { Organization } from '../src/models/organization.model.js';
import { Department } from '../src/models/department.model.js';
import { User } from '../src/models/user.model.js';
import { Skill } from '../src/models/skill.model.js';
import { Career } from '../src/models/career.model.js';
import { CareerRequirement } from '../src/models/careerRequirement.model.js';
import { StudentProfile } from '../src/models/studentProfile.model.js';
import { Assessment } from '../src/models/assessment.model.js';
import { AssessmentAttempt } from '../src/models/assessmentAttempt.model.js';
import { Roadmap } from '../src/models/roadmap.model.js';
import { Project } from '../src/models/project.model.js';
import { Resume } from '../src/models/resume.model.js';
import { InterviewSession } from '../src/models/interviewSession.model.js';
import { Job } from '../src/models/job.model.js';
import { JobApplication } from '../src/models/jobApplication.model.js';

export async function seedDatabase() {
  logger.info('🌱 Starting SkillBridge Database Seeding...');

  // 1. Clear existing collections
  await Organization.deleteMany({});
  await Department.deleteMany({});
  await User.deleteMany({});
  await Skill.deleteMany({});
  await Career.deleteMany({});
  await CareerRequirement.deleteMany({});
  await StudentProfile.deleteMany({});
  await Assessment.deleteMany({});
  await AssessmentAttempt.deleteMany({});
  await Roadmap.deleteMany({});
  await Project.deleteMany({});
  await Resume.deleteMany({});
  await InterviewSession.deleteMany({});
  await Job.deleteMany({});
  await JobApplication.deleteMany({});

  logger.info('🧹 Cleaned existing records.');

  // 2. Create Sample Organization
  const adtuOrg = await Organization.create({
    name: 'Assam Down Town University',
    slug: 'adtu',
    domain: 'adtu.edu.in',
    logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200',
    address: {
      street: 'Sankar Madhab Path, Gandhi Nagar, Panikhaiti',
      city: 'Guwahati',
      state: 'Assam',
      country: 'India',
      zipCode: '781026',
    },
    settings: {
      allowedDomains: ['adtu.edu.in', 'student.adtu.edu.in'],
      defaultPlacementWeightages: {
        technicalSkills: 30,
        assessmentPerformance: 20,
        projects: 15,
        resume: 10,
        interviewPerformance: 15,
        roadmapProgress: 10,
      },
    },
  });

  // 3. Create Departments
  const cseDept = await Department.create({
    organizationId: adtuOrg._id,
    name: 'Computer Science & Engineering',
    code: 'CSE',
    headOfDepartment: 'Dr. Asif',
  });

  const itDept = await Department.create({
    organizationId: adtuOrg._id,
    name: 'Information Technology',
    code: 'IT',
    headOfDepartment: 'Dr. Ramesh Kumar',
  });

  const eceDept = await Department.create({
    organizationId: adtuOrg._id,
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    headOfDepartment: 'Dr. Anita Desai',
  });

  // 4. Create Standard Users
  const superAdmin = await User.create({
    name: 'Platform SuperAdmin',
    email: 'superadmin@skillbridge.com',
    role: 'SUPER_ADMIN',
    isActive: true,
  });

  const collegeAdmin = await User.create({
    name: 'Asif',
    email: 'asif@adtu.edu.in',
    role: 'COLLEGE_ADMIN',
    organizationId: adtuOrg._id,
    departmentId: cseDept._id,
    isActive: true,
  });

  const studentAlex = await User.create({
    name: 'Suraj',
    email: 'suraj@adtu.edu.in',
    role: 'STUDENT',
    organizationId: adtuOrg._id,
    departmentId: cseDept._id,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isActive: true,
  });

  // 5. Master Skills
  const skillsData = [
    { name: 'JavaScript', category: 'Programming', description: 'Core ECMAScript and asynchronous patterns' },
    { name: 'TypeScript', category: 'Programming', description: 'Static typing and advanced generics' },
    { name: 'Python', category: 'Programming', description: 'Python syntax, standard library, and OOP' },
    { name: 'Java', category: 'Programming', description: 'Core Java, multithreading, and JVM mechanics' },
    { name: 'C++', category: 'Programming', description: 'STL, memory management, and pointers' },
    { name: 'Data Structures & Algorithms', category: 'Programming', description: 'Arrays, trees, graphs, dynamic programming' },
    { name: 'React', category: 'Frontend', description: 'Hooks, virtual DOM, context, state management' },
    { name: 'Next.js', category: 'Frontend', description: 'SSR, SSG, App Router, and fullstack React' },
    { name: 'HTML5 & CSS3', category: 'Frontend', description: 'Semantic markup, Flexbox, Grid, Responsive Design' },
    { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first modern styling' },
    { name: 'Node.js', category: 'Backend', description: 'Event loop, streams, clusters, V8 engine' },
    { name: 'Express.js', category: 'Backend', description: 'Routing, middleware pipelines, error handling' },
    { name: 'System Design', category: 'Backend', description: 'Scalability, microservices, load balancing, sharding' },
    { name: 'REST APIs', category: 'Backend', description: 'HTTP verbs, status codes, idempotency, caching' },
    { name: 'MongoDB', category: 'Database', description: 'Document modeling, aggregation pipelines, indexes' },
    { name: 'PostgreSQL', category: 'Database', description: 'Relational design, ACID, complex joins, indexing' },
    { name: 'Redis', category: 'Database', description: 'In-memory caching, Pub/Sub, rate limiting' },
    { name: 'SQL', category: 'Database', description: 'Query optimization, DDL, DML, window functions' },
    { name: 'Docker', category: 'DevOps', description: 'Containers, Dockerfile, multi-stage builds, compose' },
    { name: 'Kubernetes', category: 'DevOps', description: 'Pods, deployments, services, ingress' },
    { name: 'CI/CD Pipelines', category: 'DevOps', description: 'GitHub Actions, automated testing, releases' },
    { name: 'AWS', category: 'Cloud', description: 'EC2, S3, Lambda, ECS, RDS, IAM' },
    { name: 'Machine Learning Fundamentals', category: 'AI/ML', description: 'Supervised, unsupervised algorithms, evaluation' },
    { name: 'Pandas & NumPy', category: 'Data', description: 'Data wrangling, matrix operations, exploratory analysis' },
    { name: 'Communication & Articulation', category: 'Soft Skills', description: 'Clear technical communication, presentation' },
  ];

  const skillDocs = await Skill.insertMany(skillsData);
  const skillMap = {};
  skillDocs.forEach((s) => {
    skillMap[s.name] = s;
  });

  logger.info(`✨ Seeded ${skillDocs.length} master skills.`);

  // 6. Master Careers & Requirements
  const fullStackCareer = await Career.create({
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Engineering',
    overview: 'Builds end-to-end scalable web applications across modern frontend and backend architectures.',
    marketDemand: 'VERY_HIGH',
    averageSalaryRange: { min: 600000, max: 1800000, currency: 'INR' },
    isActive: true,
  });

  const backendCareer = await Career.create({
    title: 'Backend Developer',
    slug: 'backend-developer',
    category: 'Software Engineering',
    overview: 'Architects robust server systems, APIs, database schemas, and microservice infrastructure.',
    marketDemand: 'VERY_HIGH',
    averageSalaryRange: { min: 650000, max: 1900000, currency: 'INR' },
    isActive: true,
  });

  await CareerRequirement.insertMany([
    { careerId: fullStackCareer._id, skillId: skillMap['JavaScript']._id, importance: 'Critical', requiredProficiency: 4, weight: 10 },
    { careerId: fullStackCareer._id, skillId: skillMap['React']._id, importance: 'High', requiredProficiency: 3, weight: 9 },
    { careerId: fullStackCareer._id, skillId: skillMap['Node.js']._id, importance: 'High', requiredProficiency: 3, weight: 9 },
    { careerId: fullStackCareer._id, skillId: skillMap['Data Structures & Algorithms']._id, importance: 'High', requiredProficiency: 4, weight: 8 },
    { careerId: fullStackCareer._id, skillId: skillMap['MongoDB']._id, importance: 'High', requiredProficiency: 3, weight: 7 },
    { careerId: fullStackCareer._id, skillId: skillMap['REST APIs']._id, importance: 'High', requiredProficiency: 4, weight: 7 },
    { careerId: fullStackCareer._id, skillId: skillMap['Docker']._id, importance: 'Medium', requiredProficiency: 2, weight: 6 },
    { careerId: fullStackCareer._id, skillId: skillMap['System Design']._id, importance: 'Medium', requiredProficiency: 3, weight: 6 },

    { careerId: backendCareer._id, skillId: skillMap['Node.js']._id, importance: 'Critical', requiredProficiency: 4, weight: 10 },
    { careerId: backendCareer._id, skillId: skillMap['System Design']._id, importance: 'Critical', requiredProficiency: 4, weight: 10 },
    { careerId: backendCareer._id, skillId: skillMap['MongoDB']._id, importance: 'High', requiredProficiency: 3, weight: 8 },
    { careerId: backendCareer._id, skillId: skillMap['REST APIs']._id, importance: 'High', requiredProficiency: 4, weight: 8 },
    { careerId: backendCareer._id, skillId: skillMap['Docker']._id, importance: 'High', requiredProficiency: 3, weight: 7 },
    { careerId: backendCareer._id, skillId: skillMap['Data Structures & Algorithms']._id, importance: 'High', requiredProficiency: 4, weight: 8 },
  ]);

  logger.info('✨ Seeded careers and requirements.');

  // 7. Assessments
  await Assessment.create({
    title: 'React Intermediate Assessment',
    description: 'Evaluate understanding of state, hooks, and component lifecycle',
    skillId: skillMap['React']._id,
    difficulty: 'INTERMEDIATE',
    durationMinutes: 20,
    passingScore: 70,
    questions: [
      {
        questionText: 'What triggers a React component re-render?',
        options: ['State or prop changes', 'Variable assignment', 'DOM mutation', 'CSS transition'],
        correctOptionIndex: 0,
        explanation: 'State or prop updates cause virtual DOM diffing.',
        points: 10,
      },
      {
        questionText: 'When is the cleanup function of useEffect called?',
        options: ['Before unmounting and before the next effect run', 'Only on unmount', 'Before initial render', 'Never'],
        correctOptionIndex: 0,
        explanation: 'Cleanup executes before re-running the effect and upon component unmount.',
        points: 10,
      },
    ],
  });

  // 8. Student Profile for Alex Chen
  await StudentProfile.create({
    userId: studentAlex._id,
    organizationId: adtuOrg._id,
    departmentId: cseDept._id,
    rollNumber: '2023CSE042',
    graduationYear: 2027,
    cgpa: 8.5,
    targetCareerId: fullStackCareer._id,
    skills: [
      { skillId: skillMap['JavaScript']._id, skillName: 'JavaScript', proficiencyLevel: 4, verified: true },
      { skillId: skillMap['React']._id, skillName: 'React', proficiencyLevel: 3, verified: true },
      { skillId: skillMap['Node.js']._id, skillName: 'Node.js', proficiencyLevel: 3, verified: true },
      { skillId: skillMap['Data Structures & Algorithms']._id, skillName: 'Data Structures & Algorithms', proficiencyLevel: 2, verified: false },
    ],
    readinessScore: {
      overall: 74,
      breakdown: {
        technicalSkills: 75,
        assessmentPerformance: 80,
        projects: 75,
        resume: 70,
        interviewPerformance: 70,
        roadmapProgress: 60,
      },
      lastCalculatedAt: new Date(),
    },
  });

  // 9. Sample Roadmap for Alex Chen
  await Roadmap.create({
    studentId: studentAlex._id,
    careerId: fullStackCareer._id,
    title: 'Full Stack Engineering Readiness Roadmap',
    durationWeeks: 8,
    progressPercentage: 50,
    status: 'ACTIVE',
    milestones: [
      {
        weekNumber: 1,
        title: 'Core Backend Scalability & Streams',
        description: 'Master Node.js event loop internals and HTTP streaming pipelines.',
        isCompleted: true,
        tasks: [
          { taskId: 't1', title: 'Implement backpressure handling stream server', isCompleted: true },
          { taskId: 't2', title: 'Benchmark cluster worker scaling under load', isCompleted: true },
        ],
      },
      {
        weekNumber: 2,
        title: 'System Design: Distributed Caching & Message Queues',
        description: 'Design idempotent transactional services using Redis caching and RabbitMQ.',
        isCompleted: false,
        tasks: [
          { taskId: 't3', title: 'Implement Redis write-through caching layer', isCompleted: false },
          { taskId: 't4', title: 'Design database sharding strategy for 10M records', isCompleted: false },
        ],
      },
    ],
  });

  // 10. Sample Project
  await Project.create({
    studentId: studentAlex._id,
    organizationId: adtuOrg._id,
    title: 'Real-Time Collaborative Workspace',
    description: 'Engineered a collaborative canvas using WebSockets, Node.js, and Redis Pub/Sub.',
    technologies: ['React', 'Node.js', 'Socket.io', 'Redis'],
    githubUrl: 'https://github.com/suraj/collab-canvas',
    liveUrl: 'https://collab-canvas.apex-demo.app',
    evaluationScore: 85,
  });

  // 11. Sample Job Vacancies
  const sampleJob = await Job.create({
    organizationId: adtuOrg._id,
    title: 'Software Engineer - Full Stack',
    company: 'TechCorp Solutions',
    location: 'Bangalore, India',
    jobType: 'FULL_TIME',
    workplaceType: 'HYBRID',
    description: 'Seeking passionate full-stack engineers skilled in React, Node.js, and MongoDB.',
    salaryRange: { min: 800000, max: 1400000, currency: 'INR' },
    requiredSkills: [
      { skillId: skillMap['JavaScript']._id, minProficiency: 4, weight: 10 },
      { skillId: skillMap['React']._id, minProficiency: 3, weight: 9 },
      { skillId: skillMap['Node.js']._id, minProficiency: 3, weight: 9 },
      { skillId: skillMap['Docker']._id, minProficiency: 2, weight: 6 },
    ],
    createdBy: collegeAdmin._id,
    isActive: true,
  });

  // 12. Sample Application
  await JobApplication.create({
    jobId: sampleJob._id,
    studentId: studentAlex._id,
    organizationId: adtuOrg._id,
    coverLetter: 'Excited to apply for the Full Stack Engineer position at TechCorp.',
    matchScoreAtApplication: 78,
    status: 'UNDER_REVIEW',
  });

  logger.info('🎉 SkillBridge database seed successfully completed with full 14-phase demo data!');
}

// Standalone execution support
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      logger.error(`Seed failed: ${err.message}`);
      process.exit(1);
    }
  })();
}