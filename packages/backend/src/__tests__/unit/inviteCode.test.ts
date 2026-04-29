import { describe, it, expect } from '@jest/globals';
import { generateInviteCode, generateResetToken } from '../../utils/inviteCode.js';

describe('invite code utilities', () => {
  describe('generateInviteCode', () => {
    it('should generate an 8-character code', () => {
      const code = generateInviteCode();

      expect(code.length).toBe(8);
    });

    it('should only contain lowercase letters and numbers', () => {
      const code = generateInviteCode();

      expect(code).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateInviteCode());
      }

      expect(codes.size).toBe(100);
    });
  });

  describe('generateResetToken', () => {
    it('should generate a 64-character hex token', () => {
      const token = generateResetToken();

      expect(token.length).toBe(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateResetToken());
      }

      expect(tokens.size).toBe(100);
    });
  });
});
