import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { requireAuth } from '../src/middleware/auth.middleware.js';
import { requireRole } from '../src/middleware/role.middleware.js';
import { requireOrganizationAccess } from '../src/middleware/organizationScope.middleware.js';
import { success } from '../src/utils/responseEnvelope.js';
import { errorHandler } from '../src/middleware/error.middleware.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/v1/auth/dev-login', () => {
  it('creates and authenticates a new student user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({
        email: 'alex.chen@apex.edu',
        name: 'Alex Chen',
        role: 'STUDENT',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('alex.chen@apex.edu');
    expect(res.body.data.user.role).toBe('STUDENT');

    const dbUser = await User.findOne({ email: 'alex.chen@apex.edu' });
    expect(dbUser).not.toBeNull();
    expect(dbUser.name).toBe('Alex Chen');
  });

  it('authenticates an existing user and returns JWT token', async () => {
    await User.create({
      name: 'Sarah Admin',
      email: 'sarah.admin@apex.edu',
      role: 'COLLEGE_ADMIN',
    });

    const res = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({
        email: 'sarah.admin@apex.edu',
        role: 'COLLEGE_ADMIN',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.role).toBe('COLLEGE_ADMIN');
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects invalid email address with validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({
        email: 'not-an-email',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns current user profile when valid Bearer token is provided', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({
        email: 'student@apex.edu',
        name: 'Jane Doe',
        role: 'STUDENT',
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('student@apex.edu');
    expect(meRes.body.data.user.name).toBe('Jane Doe');
    expect(meRes.body.data.user.role).toBe('STUDENT');
  });

  it('returns 401 UNAUTHORIZED when no token is provided', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 UNAUTHORIZED when token is invalid or tampered', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid_token_12345');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Role & Multi-Tenant Middleware', () => {
  let testApp;

  beforeAll(() => {
    testApp = express();
    testApp.use(express.json());

    // Protected admin route
    testApp.get(
      '/admin-only',
      requireAuth,
      requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'),
      (req, res) => success(res, { secret: 'admin_data' })
    );

    // Protected org-scoped route
    testApp.get(
      '/org-scoped',
      requireAuth,
      requireOrganizationAccess,
      (req, res) => success(res, { orgId: req.tenantOrgId })
    );

    testApp.use(errorHandler);
  });

  it('permits COLLEGE_ADMIN to access admin-only endpoint', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({ email: 'admin@apex.edu', role: 'COLLEGE_ADMIN' });

    const token = loginRes.body.data.token;

    const res = await request(testApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.secret).toBe('admin_data');
  });

  it('blocks STUDENT from accessing admin-only endpoint with 403 FORBIDDEN', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({ email: 'student@apex.edu', role: 'STUDENT' });

    const token = loginRes.body.data.token;

    const res = await request(testApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('attaches verified tenantOrgId on org-scoped requests', async () => {
    const orgId = new mongoose.Types.ObjectId().toString();
    const loginRes = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({ email: 'org.user@apex.edu', role: 'STUDENT', organizationId: orgId });

    const token = loginRes.body.data.token;

    const res = await request(testApp)
      .get('/org-scoped')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.orgId).toBe(orgId);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('returns 200 when logging out with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/dev-login')
      .send({
        email: 'logout.test@apex.edu',
      });

    const token = loginRes.body.data.token;

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });
});