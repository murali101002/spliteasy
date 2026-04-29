export interface SimplifiedDebt {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function simplifyDebts(balances: Map<string, number>): SimplifiedDebt[] {
  const settlements: SimplifiedDebt[] = [];
  const creditors: [string, number][] = [];
  const debtors: [string, number][] = [];

  balances.forEach((balance, userId) => {
    const rounded = round(balance, 2);
    if (rounded > 0.001) {
      creditors.push([userId, rounded]);
    } else if (rounded < -0.001) {
      debtors.push([userId, -rounded]);
    }
  });

  creditors.sort((a, b) => b[1] - a[1]);
  debtors.sort((a, b) => b[1] - a[1]);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = round(Math.min(debtors[i][1], creditors[j][1]), 2);

    if (amount > 0) {
      settlements.push({
        fromUserId: debtors[i][0],
        toUserId: creditors[j][0],
        amount,
      });
    }

    debtors[i][1] = round(debtors[i][1] - amount, 2);
    creditors[j][1] = round(creditors[j][1] - amount, 2);

    if (debtors[i][1] < 0.01) i++;
    if (creditors[j][1] < 0.01) j++;
  }

  return settlements;
}
