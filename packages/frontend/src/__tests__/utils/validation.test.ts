import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateGroupName,
  validateExpenseDescription,
  validateAmount,
} from '@/utils/validation';

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('returns error for missing @', () => {
    expect(validateEmail('invalid')).toBe('Invalid email address');
  });

  it('returns error for empty', () => {
    expect(validateEmail('')).toBe('Email is required');
  });
});

describe('validatePassword', () => {
  it('returns null for valid password', () => {
    expect(validatePassword('password123')).toBeNull();
  });

  it('returns error for too short', () => {
    expect(validatePassword('ab1')).toBe('Password must be at least 8 characters');
  });

  it('returns error for no number', () => {
    expect(validatePassword('passwordonly')).toBe('Password must contain at least one number');
  });

  it('returns error for empty', () => {
    expect(validatePassword('')).toBe('Password is required');
  });
});

describe('validateName', () => {
  it('returns null for valid name', () => {
    expect(validateName('Alice')).toBeNull();
  });

  it('returns error for empty', () => {
    expect(validateName('')).toBe('Name is required');
  });
});

describe('validateGroupName', () => {
  it('returns null for valid name', () => {
    expect(validateGroupName('Trip to Paris')).toBeNull();
  });

  it('returns error for empty', () => {
    expect(validateGroupName('')).toBe('Group name is required');
  });

  it('returns error for name over 50 chars', () => {
    const longName = 'a'.repeat(51);
    expect(validateGroupName(longName)).toBe('Group name must be 50 characters or less');
  });
});

describe('validateExpenseDescription', () => {
  it('returns null for valid description', () => {
    expect(validateExpenseDescription('Dinner at Italian place')).toBeNull();
  });

  it('returns error for empty', () => {
    expect(validateExpenseDescription('')).toBe('Description is required');
  });

  it('returns error over 100 chars', () => {
    expect(validateExpenseDescription('a'.repeat(101))).toBe(
      'Description must be 100 characters or less'
    );
  });
});

describe('validateAmount', () => {
  it('returns null for valid amount', () => {
    expect(validateAmount('25.50')).toBeNull();
  });

  it('returns error for negative', () => {
    expect(validateAmount('-5')).toBe('Amount must be greater than 0');
  });

  it('returns error for zero', () => {
    expect(validateAmount('0')).toBe('Amount must be greater than 0');
  });

  it('returns error for non-number', () => {
    expect(validateAmount('abc')).toBe('Invalid amount');
  });
});
