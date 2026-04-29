import { describe, it, expect } from '@jest/globals';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../../utils/password.js';

describe('password utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      const result = await verifyPassword('wrongpassword', hash);

      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept a valid password', () => {
      const result = validatePasswordStrength('password123');

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject a password shorter than 8 characters', () => {
      const result = validatePasswordStrength('pass1');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must be at least 8 characters');
    });

    it('should reject a password without numbers', () => {
      const result = validatePasswordStrength('passwordonly');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must contain at least one number');
    });

    it('should accept passwords with special characters', () => {
      const result = validatePasswordStrength('p@ssw0rd!');

      expect(result.valid).toBe(true);
    });
  });
});
