import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getInitials,
  getBalanceColor,
  getBalanceText,
} from '@/utils/format';

describe('formatCurrency', () => {
  it('formats positive values', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats values with cents', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });
});

describe('formatDate', () => {
  it('returns a formatted date string', () => {
    const result = formatDate('2024-11-15T10:30:00Z');
    expect(result).toContain('2024');
  });
});

describe('formatRelativeDate', () => {
  it('returns "just now" for recent dates', () => {
    const now = new Date();
    now.setSeconds(now.getSeconds() - 10);
    expect(formatRelativeDate(now.toISOString())).toBe('just now');
  });

  it('formats minutes ago', () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - 5);
    expect(formatRelativeDate(now.toISOString())).toMatch(/\d+m ago/);
  });

  it('formats hours ago', () => {
    const now = new Date();
    now.setHours(now.getHours() - 3);
    expect(formatRelativeDate(now.toISOString())).toMatch(/\d+h ago/);
  });

  it('formats days ago', () => {
    const now = new Date();
    now.setDate(now.getDate() - 4);
    expect(formatRelativeDate(now.toISOString())).toMatch(/\d+d ago/);
  });
});

describe('getInitials', () => {
  it('returns initials from a two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns single initial for single word', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('returns max two initials for multi-word names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('returns empty for empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('getBalanceColor', () => {
  it('returns green class for positive balance', () => {
    expect(getBalanceColor(10)).toContain('green');
  });

  it('returns red class for negative balance', () => {
    expect(getBalanceColor(-5)).toContain('red');
  });

  it('returns gray class for zero', () => {
    expect(getBalanceColor(0)).toContain('gray');
  });
});

describe('getBalanceText', () => {
  it('describes being owed money', () => {
    expect(getBalanceText(25)).toContain('owed');
  });

  it('describes owing money', () => {
    expect(getBalanceText(-10)).toContain('owe');
  });

  it('describes settled up', () => {
    expect(getBalanceText(0)).toContain('settled');
  });
});
