import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createTestApp, request, testPrisma } from '../helpers.js';
import type { Express } from 'express';

let app: Express;

beforeAll(async () => {
  app = createTestApp();
  await testPrisma.$connect();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

beforeEach(async () => {
  await testPrisma.expenseShare.deleteMany();
  await testPrisma.expense.deleteMany();
  await testPrisma.settlement.deleteMany();
  await testPrisma.groupMember.deleteMany();
  await testPrisma.group.deleteMany();
  await testPrisma.user.deleteMany();
});

describe('POST /api/auth/register', () => {
  it('creates a user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@example.com', password: 'password1', name: 'New User' })
      .expect(201);

    expect(res.body.user.email).toBe('newuser@example.com');
    expect(res.body.token).toBeDefined();
  });

  it('rejects duplicate email with 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password1', name: 'First' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password1', name: 'Second' })
      .expect(409);

    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects weak password with 400', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'short', name: 'Test' })
      .expect(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'password1', name: 'Login Test' });
  });

  it('authenticates valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password1' })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('rejects wrong password with 401', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpassword1' })
      .expect(401);
  });

  it('rejects non-existent email with 401', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password1' })
      .expect(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 for any email (avoids user enumeration)', async () => {
    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'doesnotexist@example.com' })
      .expect(200);
  });
});
