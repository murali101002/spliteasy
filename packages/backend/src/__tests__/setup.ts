import { jest } from '@jest/globals';

jest.setTimeout(10000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/spliteasy_test';
process.env.FRONTEND_URL = 'http://localhost:5173';
