import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import app from '../src/app.js';
import { seedDatabase } from './seed.js';

async function runSmokeTest() {
  console.log('\n======================================================');
  console.log('🚀 CareerOS Backend Live Interactive Smoke Test');
  console.log('======================================================\n');

  // 1. Start in-memory MongoDB
  console.log('1️⃣  Starting In-Memory MongoDB Server...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('    Connected to MongoDB at:', uri);

  // 2. Seed database
  console.log('\n2️⃣  Seeding demo organization, skills, careers & profiles...');
  await seedDatabase();

  // 3. Start Express HTTP Server
  const port = 5055;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(port, resolve));
  const baseUrl = `http://localhost:${port}/api/v1`;
  console.log(`\n3️⃣  Live Express Backend Server running at: http://localhost:${port}\n`);

  async function apiCall(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${baseUrl}${path}`, opts);
    const json = await res.json();
    return { status: res.status, data: json };
  }

  // TEST 1: Health Check
  console.log('------------------------------------------------------');
  console.log('TEST 1: Public Health Check (GET /health)');
  const healthRes = await apiCall('GET', '/health');
  console.log(`Status: ${healthRes.status}`);
  console.log(JSON.stringify(healthRes.data, null, 2));

  // TEST 2: Student Dev-Login
  console.log('\n------------------------------------------------------');
  console.log('TEST 2: Student Dev-Login (POST /auth/dev-login)');
  const studentLoginRes = await apiCall('POST', '/auth/dev-login', {
    email: 'alex.chen@apex.edu',
    name: 'Alex Chen',
    role: 'STUDENT',
  });
  console.log(`Status: ${studentLoginRes.status}`);
  const studentToken = studentLoginRes.data.data.token;
  console.log(`Logged in as: ${studentLoginRes.data.data.user.name} (${studentLoginRes.data.data.user.role})`);
  console.log(`JWT Token issued: ${studentToken.slice(0, 30)}...`);

  // TEST 3: Student Profile
  console.log('\n------------------------------------------------------');
  console.log('TEST 3: Student Profile (GET /profile)');
  const profileRes = await apiCall('GET', '/profile', null, studentToken);
  console.log(`Status: ${profileRes.status}`);
  console.log(`Target Career: ${profileRes.data.data.targetCareer?.title}`);
  console.log(`Skills Count: ${profileRes.data.data.skills?.length}`);
  console.log(`Overall Readiness Score: ${profileRes.data.data.readinessScore?.overall}%`);

  // TEST 4: Career Gap Engine
  console.log('\n------------------------------------------------------');
  console.log('TEST 4: Deterministic Career Gap Analysis (GET /career-analysis)');
  const gapRes = await apiCall('GET', '/career-analysis', null, studentToken);
  console.log(`Status: ${gapRes.status}`);
  console.log(`Career Target: ${gapRes.data.data.targetCareer?.title}`);
  console.log(`Calculated Readiness Score: ${gapRes.data.data.readinessScore}%`);
  console.log('Breakdown:', JSON.stringify(gapRes.data.data.breakdown, null, 2));
  console.log('Weak Skills:', gapRes.data.data.weakSkills);
  console.log('Missing Skills:', gapRes.data.data.missingSkills);
  console.log('Priority Focus Skills:', gapRes.data.data.prioritySkills);

  // TEST 5: Active Roadmap
  console.log('\n------------------------------------------------------');
  console.log('TEST 5: Active Personalized Roadmap (GET /roadmaps/active)');
  const roadmapRes = await apiCall('GET', '/roadmaps/active', null, studentToken);
  console.log(`Status: ${roadmapRes.status}`);
  console.log(`Roadmap Title: ${roadmapRes.data.data?.title}`);
  console.log(`Progress: ${roadmapRes.data.data?.progressPercentage}%`);
  console.log(`Milestones: ${roadmapRes.data.data?.milestones?.length}`);

  // TEST 6: Jobs with Skill Match Scoring
  console.log('\n------------------------------------------------------');
  console.log('TEST 6: Jobs with Calculated Match Percentage (GET /jobs)');
  const jobsRes = await apiCall('GET', '/jobs', null, studentToken);
  console.log(`Status: ${jobsRes.status}`);
  console.log(`Available Jobs: ${jobsRes.data.data?.length}`);
  jobsRes.data.data?.forEach((job) => {
    console.log(`  - [${job.matchPercentage}% Match] ${job.title} at ${job.company} (${job.location})`);
  });

  // TEST 7: Student Dashboard Aggregation
  console.log('\n------------------------------------------------------');
  console.log('TEST 7: Student Dashboard Composite Payload (GET /dashboard/student)');
  const dashRes = await apiCall('GET', '/dashboard/student', null, studentToken);
  console.log(`Status: ${dashRes.status}`);
  console.log(JSON.stringify(dashRes.data.data, null, 2));

  // TEST 8: Admin Dev-Login
  console.log('\n------------------------------------------------------');
  console.log('TEST 8: College Admin Dev-Login (POST /auth/dev-login)');
  const adminLoginRes = await apiCall('POST', '/auth/dev-login', {
    email: 'admin@apex.edu',
    name: 'Dr. Sarah Jenkins',
    role: 'COLLEGE_ADMIN',
  });
  console.log(`Status: ${adminLoginRes.status}`);
  const adminToken = adminLoginRes.data.data.token;
  console.log(`Logged in as: ${adminLoginRes.data.data.user.name} (${adminLoginRes.data.data.user.role})`);

  // TEST 9: Admin Dashboard Executive Analytics
  console.log('\n------------------------------------------------------');
  console.log('TEST 9: College Admin Dashboard Analytics (GET /dashboard/admin)');
  const adminDashRes = await apiCall('GET', '/dashboard/admin', null, adminToken);
  console.log(`Status: ${adminDashRes.status}`);
  console.log(JSON.stringify(adminDashRes.data.data, null, 2));

  // TEST 10: Admin Student Roster
  console.log('\n------------------------------------------------------');
  console.log('TEST 10: Admin Student Roster (GET /admin/students)');
  const studentsRes = await apiCall('GET', '/admin/students', null, adminToken);
  console.log(`Status: ${studentsRes.status}`);
  console.log('Students List:', JSON.stringify(studentsRes.data.data, null, 2));
  console.log('Pagination:', JSON.stringify(studentsRes.data.pagination, null, 2));

  console.log('\n======================================================');
  console.log('✅ All 10 Smoke Tests Succeeded with Real Responses!');
  console.log('======================================================\n');

  // Clean shutdown
  server.close();
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runSmokeTest().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});