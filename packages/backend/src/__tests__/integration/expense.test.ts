import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createTestApp, request, registerTestUser, createTestGroup, testPrisma } from '../helpers.js';
import type { Express } from 'express';

let app: Express;
let token: string;
let groupId: string;

beforeAll(async () => {
  app = createTestApp();
  await testPrisma.$connect();
  const user = await registerTestUser(app, { email: 'expensetest@example.com' });
  token = user.token;
  const group = await createTestGroup(app, token, 'Expense Group');
  groupId = group.id;
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

describe('POST /api/groups/:groupId/expenses', () => {
  it('creates an expense with equal split', async () => {
    const { body: group } = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    const memberIds = group.members.map((m: { id: string }) => m.id);

    const res = await request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Dinner',
        amount: 90,
        paidById: memberIds[0],
        splitType: 'EQUAL',
        splitWith: memberIds,
      })
      .expect(201);

    expect(res.body.description).toBe('Dinner');
    expect(res.body.amount).toBe(90);
  });

  it('creates an expense with exact split', async () => {
    const { body: group } = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    const memberIds = group.members.map((m: { id: string }) => m.id);

    const res = await request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Groceries',
        amount: 100,
        paidById: memberIds[0],
        splitType: 'EXACT',
        shares: [
          { userId: memberIds[0], amount: 50 },
          { userId: memberIds[1], amount: 50 },
        ],
      })
      .expect(201);

    expect(res.body.splitType).toBe('EXACT');
  });

  it('rejects exact split when shares do not sum to amount', async () => {
    const { body: group } = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    const memberIds = group.members.map((m: { id: string }) => m.id);

    await request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Mismatch',
        amount: 100,
        paidById: memberIds[0],
        splitType: 'EXACT',
        shares: [
          { userId: memberIds[0], amount: 30 },
          { userId: memberIds[1], amount: 30 },
        ],
      })
      .expect(400);
  });
});

describe('DELETE /api/groups/:groupId/expenses/:expenseId', () => {
  it('soft-deletes an expense', async () => {
    const { body: group } = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    const memberIds = group.members.map((m: { id: string }) => m.id);

    const createRes = await request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'To Delete',
        amount: 50,
        paidById: memberIds[0],
        splitType: 'EQUAL',
        splitWith: memberIds,
      });

    const expenseId = createRes.body.id;

    await request(app)
      .delete(`/api/groups/${groupId}/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const getRes = await request(app)
      .get(`/api/groups/${groupId}/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.body.isDeleted).toBe(true);
  });
});
