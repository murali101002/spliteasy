import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createTestApp, request, registerTestUser, createTestGroup, testPrisma } from '../helpers.js';
import type { Express } from 'express';

let app: Express;
let token: string;
let userId: string;

beforeAll(async () => {
  app = createTestApp();
  await testPrisma.$connect();
  const user = await registerTestUser(app, { email: 'grouptest@example.com' });
  token = user.token;
  userId = user.id;
});

afterAll(async () => {
  await testPrisma.expenseShare.deleteMany();
  await testPrisma.expense.deleteMany();
  await testPrisma.settlement.deleteMany();
  await testPrisma.groupMember.deleteMany();
  await testPrisma.group.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.$disconnect();
});

describe('POST /api/groups', () => {
  it('creates a group with invite code', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Group' })
      .expect(201);

    expect(res.body.name).toBe('My Group');
    expect(res.body.inviteCode).toHaveLength(8);
    expect(res.body.inviteLink).toContain(res.body.inviteCode);
  });

  it('rejects missing name with 400', async () => {
    await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
  });
});

describe('GET /api/groups', () => {
  it('returns user groups', async () => {
    await createTestGroup(app, token, 'Test Group');
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /api/groups/join/:inviteCode', () => {
  it('joins a group via invite code', async () => {
    const group = await createTestGroup(app, token, 'Joinable Group');
    const user2 = await registerTestUser(app, { email: 'joiner@example.com', name: 'Joiner' });

    const res = await request(app)
      .post(`/api/groups/join/${group.inviteCode}`)
      .set('Authorization', `Bearer ${user2.token}`)
      .expect(200);

    expect(res.body.name).toBe('Joinable Group');
  });

  it('rejects invalid invite code with 404', async () => {
    await request(app)
      .post('/api/groups/join/INVALID01')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});

describe('DELETE /api/groups/:id/leave', () => {
  it('leaves group when balance is zero', async () => {
    const group = await createTestGroup(app, token, 'Leave Group');
    await request(app)
      .delete(`/api/groups/${group.id}/leave`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
