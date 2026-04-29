import { describe, it, expect } from '@jest/globals';
import { generateToken, verifyToken } from '../../utils/jwt.js';

describe('JWT utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'test-user-id';
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const userId = 'test-user-id';
      const token = generateToken(userId);

      const payload = verifyToken(token);

      expect(payload.userId).toBe(userId);
    });

    it('should throw for an invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw for a tampered token', () => {
      const userId = 'test-user-id';
      const token = generateToken(userId);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyToken(tamperedToken)).toThrow();
    });
  });
});
