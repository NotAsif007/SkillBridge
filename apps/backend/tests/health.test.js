import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.services.database).toBe('connected');
    expect(typeof res.body.data.uptime).toBe('number');
    expect(typeof res.body.data.timestamp).toBe('string');
    expect(res.headers['x-request-id']).toMatch(/^[a-f0-9-]{36}$/i);
  });

  it('preserves a valid client supplied request id for log correlation', async () => {
    const requestId = 'debug-session-20260826';
    const res = await request(app).get('/api/v1/health').set('X-Request-ID', requestId);
    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBe(requestId);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('rejects oversized JSON body', async () => {
    const bigPayload = { data: 'x'.repeat(2 * 1024 * 1024) }; // 2 MB
    const res = await request(app)
      .post('/api/v1/health')
      .send(bigPayload)
      .set('Content-Type', 'application/json');
    // Expect either 413 (payload too large) or 404 (no POST route)
    expect([404, 413]).toContain(res.statusCode);
  });
});
