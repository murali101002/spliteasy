import { describe, it, expect } from '@jest/globals';
import { simplifyDebts } from '../../utils/debtSimplifier.js';

describe('simplifyDebts', () => {
  it('should return empty array when all balances are zero', () => {
    const balances = new Map([
      ['A', 0],
      ['B', 0],
      ['C', 0],
    ]);

    const result = simplifyDebts(balances);

    expect(result).toEqual([]);
  });

  it('should handle simple two-person debt', () => {
    const balances = new Map([
      ['A', -10],
      ['B', 10],
    ]);

    const result = simplifyDebts(balances);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fromUserId: 'A',
      toUserId: 'B',
      amount: 10,
    });
  });

  it('should simplify chain debt A→B→C to A→C', () => {
    const balances = new Map([
      ['A', -10],
      ['B', 0],
      ['C', 10],
    ]);

    const result = simplifyDebts(balances);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fromUserId: 'A',
      toUserId: 'C',
      amount: 10,
    });
  });

  it('should handle multiple debtors and creditors', () => {
    const balances = new Map([
      ['A', -30],
      ['B', -20],
      ['C', 25],
      ['D', 25],
    ]);

    const result = simplifyDebts(balances);

    const totalPaid = result.reduce((sum, s) => sum + s.amount, 0);
    expect(totalPaid).toBe(50);

    for (const settlement of result) {
      expect(['A', 'B']).toContain(settlement.fromUserId);
      expect(['C', 'D']).toContain(settlement.toUserId);
    }
  });

  it('should handle uneven amounts with proper rounding', () => {
    const balances = new Map([
      ['A', -33.33],
      ['B', -33.33],
      ['C', 66.66],
    ]);

    const result = simplifyDebts(balances);

    for (const settlement of result) {
      const decimalPlaces = (settlement.amount.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    }
  });

  it('should ignore very small balances (floating point errors)', () => {
    const balances = new Map([
      ['A', 0.0001],
      ['B', -0.0001],
    ]);

    const result = simplifyDebts(balances);

    expect(result).toEqual([]);
  });

  it('should handle complex scenario with 5 people', () => {
    const balances = new Map([
      ['A', -50],
      ['B', -30],
      ['C', 20],
      ['D', 40],
      ['E', 20],
    ]);

    const result = simplifyDebts(balances);

    const netByPerson = new Map<string, number>();
    for (const [person, balance] of balances) {
      netByPerson.set(person, balance);
    }

    for (const settlement of result) {
      netByPerson.set(
        settlement.fromUserId,
        (netByPerson.get(settlement.fromUserId) || 0) + settlement.amount
      );
      netByPerson.set(
        settlement.toUserId,
        (netByPerson.get(settlement.toUserId) || 0) - settlement.amount
      );
    }

    for (const [, balance] of netByPerson) {
      expect(Math.abs(balance)).toBeLessThan(0.01);
    }
  });
});
