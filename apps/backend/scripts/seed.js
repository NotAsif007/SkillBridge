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

export async function seedDatabase() {
  logger.info('🌱 Starting CareerOS Database Seeding...');

  // 1. Clear existing base catalog collections
  await Organization.deleteMany({});
  await Department.deleteMany({});
  await User.deleteMany({});
  await Skill.deleteMany({});
  await Career.deleteMany({});
  await CareerRequirement.deleteMany({});
  await StudentProfile.deleteMany({});

  logger.info('🧹 Cleaned existing records.');

  // 2. Create Sample Organization
  const apexOrg = await Organization.create({
    name: 'Apex Institute of Technology',
    slug: 'apex-tech',
    domain: 'apex.edu',
    logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200',
    address: {
      street: '100 Innovation Parkway',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      zipCode: '560100',
    },
    settings: {
      allowedDomains: ['apex.edu', 'student.apex.edu'],
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
    organizationId: apexOrg._id,
    name: 'Computer Science & Engineering',
    code: 'CSE',
    headOfDepartment: 'Dr. Sarah Jenkins',
  });

  const itDept = await Department.create({
    organizationId: apexOrg._id,
    name: 'Information Technology',
    code: 'IT',
    headOfDepartment: 'Dr. Ramesh Kumar',
  });

  const eceDept = await Department.create({
    organizationId: apexOrg._id,
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    headOfDepartment: 'Dr. Anita Desai',
  });

  // 4. Create Standard Users
  const superAdmin = await User.create({
    name: 'Platform SuperAdmin',
    email: 'superadmin@careeros.com',
    role: 'SUPER_ADMIN',
    isActive: true,
  });

  const collegeAdmin = await User.create({
    name: 'Dr. Sarah Jenkins',
    email: 'admin@apex.edu',
    role: 'COLLEGE_ADMIN',
    organizationId: apexOrg._id,
    departmentId: cseDept._id,
    isActive: true,
  });

  const studentAlex = await User.create({
    name: 'Alex Chen',
    email: 'alex.chen@apex.edu',
    role: 'STUDENT',
    organizationId: apexOrg._id,
    departmentId: cseDept._id,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isActive: true,
  });

  // 5. Master Skills
  const skillsData = [
    // Programming
    { name: 'JavaScript', category: 'Programming', description: 'Core ECMAScript and asynchronous patterns' },
    { name: 'TypeScript', category: 'Programming', description: 'Static typing and advanced generics' },
    { name: 'Python', category: 'Programming', description: 'Python syntax, standard library, and OOP' },
    { name: 'Java', category: 'Programming', description: 'Core Java, multithreading, and JVM mechanics' },
    { name: 'C++', category: 'Programming', description: 'STL, memory management, and pointers' },
    { name: 'Data Structures & Algorithms', category: 'Programming', description: 'Arrays, trees, graphs, dynamic programming' },

    // Frontend
    { name: 'React', category: 'Frontend', description: 'Hooks, virtual DOM, context, state management' },
    { name: 'Next.js', category: 'Frontend', description: 'SSR, SSG, App Router, and fullstack React' },
    { name: 'HTML5 & CSS3', category: 'Frontend', description: 'Semantic markup, Flexbox, Grid, Responsive Design' },
    { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first modern styling' },
    { name: 'Vue.js', category: 'Frontend', description: 'Reactivity, Composition API, Pinia' },

    // Backend
    { name: 'Node.js', category: 'Backend', description: 'Event loop, streams, clusters, V8 engine' },
    { name: 'Express.js', category: 'Backend', description: 'Routing, middleware pipelines, error handling' },
    { name: 'Nest.js', category: 'Backend', description: 'Enterprise TypeScript architecture, DI, modules' },
    { name: 'REST APIs', category: 'Backend', description: 'HTTP verbs, status codes, idempotency, caching' },
    { name: 'GraphQL', category: 'Backend', description: 'Schemas, resolvers, queries, mutations' },
    { name: 'System Design', category: 'Backend', description: 'Scalability, microservices, load balancing, sharding' },

    // Database
    { name: 'MongoDB', category: 'Database', description: 'Document modeling, aggregation pipelines, indexes' },
    { name: 'PostgreSQL', category: 'Database', description: 'Relational design, ACID, complex joins, indexing' },
    { name: 'Redis', category: 'Database', description: 'In-memory caching, Pub/Sub, rate limiting' },
    { name: 'SQL', category: 'Database', description: 'Query optimization, DDL, DML, window functions' },

    // DevOps & Cloud
    { name: 'Docker', category: 'DevOps', description: 'Containers, Dockerfile, multi-stage builds, compose' },
    { name: 'Kubernetes', category: 'DevOps', description: 'Pods, deployments, services, ingress' },
    { name: 'CI/CD Pipelines', category: 'DevOps', description: 'GitHub Actions, automated testing, releases' },
    { name: 'Linux & Shell Scripting', category: 'DevOps', description: 'Bash, process management, permissions' },
    { name: 'AWS', category: 'Cloud', description: 'EC2, S3, Lambda, ECS, RDS, IAM' },
    { name: 'Google Cloud Platform', category: 'Cloud', description: 'Compute Engine, Cloud Run, GCS, BigQuery' },

    // AI/ML & Data
    { name: 'Machine Learning Fundamentals', category: 'AI/ML', description: 'Supervised, unsupervised algorithms, evaluation' },
    { name: 'Deep Learning & Neural Networks', category: 'AI/ML', description: 'CNNs, RNNs, transformers, backpropagation' },
    { name: 'PyTorch', category: 'AI/ML', description: 'Tensors, autograd, model training loops' },
    { name: 'Pandas & NumPy', category: 'Data', description: 'Data wrangling, matrix operations, exploratory analysis' },
    { name: 'Data Visualization', category: 'Data', description: 'Matplotlib, Seaborn, Tableau, storytelling' },

    // Cybersecurity
    { name: 'Network Security', category: 'Cybersecurity', description: 'TCP/IP, firewalls, TLS/SSL, DNS' },
    { name: 'Application Security (OWASP)', category: 'Cybersecurity', description: 'XSS, SQLi, CSRF, auth vulnerabilities' },
    { name: 'Cryptography', category: 'Cybersecurity', description: 'Symmetric/asymmetric encryption, hashing, PKI' },

    // Soft Skills & Design
    { name: 'Communication & Articulation', category: 'Soft Skills', description: 'Clear technical communication, presentation' },
    { name: 'Problem Solving & Critical Thinking', category: 'Soft Skills', description: 'Analytical reasoning, structured approach' },
    { name: 'UI/UX Design & Figma', category: 'Frontend', description: 'Wireframing, prototyping, design tokens' },
    { name: 'Agile & Scrum', category: 'Soft Skills', description: 'Sprints, retrospectives, story points' },
  ];

  const skillDocs = await Skill.insertMany(skillsData);
  const skillMap = {};
  skillDocs.forEach((s) => {
    skillMap[s.name] = s;
  });

  logger.info(`✨ Seeded ${skillDocs.length} master skills.`);

  // 6. Master Careers & Requirements
  const careersData = [
    {
      title: 'Full Stack Developer',
      slug: 'full-stack-developer',
      category: 'Software Engineering',
      overview: 'Builds end-to-end scalable web applications across modern frontend and backend architectures.',
      marketDemand: 'VERY_HIGH',
      averageSalaryRange: { min: 600000, max: 1800000, currency: 'INR' },
      requirements: [
        { skill: 'JavaScript', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'React', importance: 'High', requiredProficiency: 3, weight: 9 },
        { skill: 'Node.js', importance: 'High', requiredProficiency: 3, weight: 9 },
        { skill: 'Data Structures & Algorithms', importance: 'High', requiredProficiency: 4, weight: 8 },
        { skill: 'MongoDB', importance: 'High', requiredProficiency: 3, weight: 7 },
        { skill: 'REST APIs', importance: 'High', requiredProficiency: 4, weight: 7 },
        { skill: 'Docker', importance: 'Medium', requiredProficiency: 2, weight: 6 },
        { skill: 'System Design', importance: 'Medium', requiredProficiency: 3, weight: 6 },
      ],
    },
    {
      title: 'Frontend Developer',
      slug: 'frontend-developer',
      category: 'Software Engineering',
      overview: 'Specializes in crafting responsive, accessible, high-performance web user interfaces.',
      marketDemand: 'HIGH',
      averageSalaryRange: { min: 500000, max: 1500000, currency: 'INR' },
      requirements: [
        { skill: 'JavaScript', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'React', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'HTML5 & CSS3', importance: 'Critical', requiredProficiency: 4, weight: 9 },
        { skill: 'TypeScript', importance: 'High', requiredProficiency: 3, weight: 8 },
        { skill: 'Tailwind CSS', importance: 'High', requiredProficiency: 3, weight: 7 },
        { skill: 'REST APIs', importance: 'Medium', requiredProficiency: 3, weight: 6 },
        { skill: 'UI/UX Design & Figma', importance: 'Medium', requiredProficiency: 2, weight: 5 },
      ],
    },
    {
      title: 'Backend Developer',
      slug: 'backend-developer',
      category: 'Software Engineering',
      overview: 'Architects robust server systems, APIs, database schemas, and microservice infrastructure.',
      marketDemand: 'VERY_HIGH',
      averageSalaryRange: { min: 650000, max: 1900000, currency: 'INR' },
      requirements: [
        { skill: 'Node.js', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'Data Structures & Algorithms', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'System Design', importance: 'Critical', requiredProficiency: 3, weight: 9 },
        { skill: 'PostgreSQL', importance: 'High', requiredProficiency: 3, weight: 8 },
        { skill: 'MongoDB', importance: 'High', requiredProficiency: 3, weight: 7 },
        { skill: 'Redis', importance: 'High', requiredProficiency: 3, weight: 7 },
        { skill: 'Docker', importance: 'Medium', requiredProficiency: 2, weight: 6 },
      ],
    },
    {
      title: 'DevOps Engineer',
      slug: 'devops-engineer',
      category: 'Infrastructure & Cloud',
      overview: 'Automates software delivery, container orchestration, CI/CD pipelines, and cloud reliability.',
      marketDemand: 'VERY_HIGH',
      averageSalaryRange: { min: 700000, max: 2000000, currency: 'INR' },
      requirements: [
        { skill: 'Docker', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'Kubernetes', importance: 'Critical', requiredProficiency: 3, weight: 9 },
        { skill: 'CI/CD Pipelines', importance: 'Critical', requiredProficiency: 4, weight: 9 },
        { skill: 'Linux & Shell Scripting', importance: 'Critical', requiredProficiency: 4, weight: 9 },
        { skill: 'AWS', importance: 'High', requiredProficiency: 3, weight: 8 },
        { skill: 'Python', importance: 'Medium', requiredProficiency: 3, weight: 6 },
      ],
    },
    {
      title: 'Machine Learning Engineer',
      slug: 'machine-learning-engineer',
      category: 'Data & AI',
      overview: 'Develops predictive statistical models, deep neural networks, and AI inference systems.',
      marketDemand: 'VERY_HIGH',
      averageSalaryRange: { min: 750000, max: 2200000, currency: 'INR' },
      requirements: [
        { skill: 'Python', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'Machine Learning Fundamentals', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'Deep Learning & Neural Networks', importance: 'High', requiredProficiency: 3, weight: 9 },
        { skill: 'PyTorch', importance: 'High', requiredProficiency: 3, weight: 8 },
        { skill: 'Pandas & NumPy', importance: 'High', requiredProficiency: 4, weight: 8 },
        { skill: 'Data Structures & Algorithms', importance: 'High', requiredProficiency: 3, weight: 7 },
      ],
    },
    {
      title: 'Data Analyst',
      slug: 'data-analyst',
      category: 'Data & AI',
      overview: 'Extracts actionable business intelligence through statistical querying, modeling, and visualization.',
      marketDemand: 'HIGH',
      averageSalaryRange: { min: 450000, max: 1200000, currency: 'INR' },
      requirements: [
        { skill: 'SQL', importance: 'Critical', requiredProficiency: 4, weight: 10 },
        { skill: 'Pandas & NumPy', importance: 'Critical', requiredProficiency: 3, weight: 9 },
        { skill: 'Data Visualization', importance: 'High', requiredProficiency: 4, weight: 9 },
        { skill: 'Python', importance: 'High', requiredProficiency: 3, weight: 8 },
        { skill: 'Communication & Articulation', importance: 'High', requiredProficiency: 4, weight: 7 },
      ],
    },
  ];

  for (const c of careersData) {
    const career = await Career.create({
      title: c.title,
      slug: c.slug,
      category: c.category,
      overview: c.overview,
      marketDemand: c.marketDemand,
      averageSalaryRange: c.averageSalaryRange,
      isActive: true,
    });

    const reqsToInsert = c.requirements
      .filter((r) => skillMap[r.skill])
      .map((r) => ({
        careerId: career._id,
        skillId: skillMap[r.skill]._id,
        importance: r.importance,
        requiredProficiency: r.requiredProficiency,
        weight: r.weight,
      }));

    if (reqsToInsert.length > 0) {
      await CareerRequirement.insertMany(reqsToInsert);
    }
  }

  logger.info(`✨ Seeded ${careersData.length} careers with weighted requirements.`);

  // 7. Initialize Student Profile for Demo User Alex Chen
  const fullStack = await Career.findOne({ slug: 'full-stack-developer' });

  await StudentProfile.create({
    userId: studentAlex._id,
    organizationId: apexOrg._id,
    departmentId: cseDept._id,
    rollNumber: '2023CSE042',
    graduationYear: 2027,
    cgpa: 8.5,
    targetCareerId: fullStack._id,
    skills: [
      {
        skillId: skillMap['JavaScript']._id,
        skillName: 'JavaScript',
        proficiencyLevel: 4,
        verified: true,
      },
      {
        skillId: skillMap['React']._id,
        skillName: 'React',
        proficiencyLevel: 3,
        verified: false,
      },
      {
        skillId: skillMap['Node.js']._id,
        skillName: 'Node.js',
        proficiencyLevel: 3,
        verified: false,
      },
      {
        skillId: skillMap['Data Structures & Algorithms']._id,
        skillName: 'Data Structures & Algorithms',
        proficiencyLevel: 2,
        verified: false,
      },
    ],
    interests: ['Full Stack Development', 'Distributed Systems', 'Cloud Native'],
    preferredRoles: ['Full Stack Engineer', 'Backend Developer'],
    preferredLocations: ['Bangalore', 'Hyderabad', 'Remote'],
    experienceLevel: 'INTERMEDIATE',
    readinessScore: {
      overall: 71,
      breakdown: {
        technicalSkills: 68,
        assessmentPerformance: 75,
        projects: 80,
        resume: 65,
        interviewPerformance: 70,
        roadmapProgress: 60,
      },
      lastCalculatedAt: new Date(),
    },
  });

  logger.info('🎉 CareerOS database seed successfully completed!');
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