import express from 'express';
import cors from 'cors';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { generalLimiter } from '../middleware/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';
import routes from '../routes/index.js';

export const testPrisma = new PrismaClient();

export function createTestApp(): express.Application {
  const app = express();
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(generalLimiter);
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

interface TestUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

export async function registerTestUser(
  app: express.Application,
  overrides: { email?: string; password?: string; name?: string } = {}
): Promise<TestUser> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: overrides.email || 'test@example.com',
      password: overrides.password || 'password1',
      name: overrides.name || 'Test User',
    });
  return { ...res.body.user, token: res.body.token };
}

export async function createTestGroup(
  app: express.Application,
  token: string,
  name = 'Test Group'
): Promise<{ id: string; inviteCode: string }> {
  const res = await request(app)
    .post('/api/groups')
    .set('Authorization', `Bearer ${token}`)
    .send({ name });
  return { id: res.body.id, inviteCode: res.body.inviteCode };
}

export { request };
