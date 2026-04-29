import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../index.js';
import type { BalanceResponse, MemberBalance } from '../types/api.js';

export async function calculateGroupBalances(groupId: string): Promise<Map<string, number>> {
  const balances = new Map<string, number>();

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });

  for (const member of members) {
    balances.set(member.userId, 0);
  }

  const expenses = await prisma.expense.findMany({
    where: {
      groupId,
      isDeleted: false,
    },
    include: {
      shares: true,
    },
  });

  for (const expense of expenses) {
    const paidById = expense.paidById;
    const amount = expense.amount.toNumber();

    const currentPaidByBalance = balances.get(paidById) || 0;
    balances.set(paidById, currentPaidByBalance + amount);

    for (const share of expense.shares) {
      const shareAmount = share.amount.toNumber();
      const currentBalance = balances.get(share.userId) || 0;
      balances.set(share.userId, currentBalance - shareAmount);
    }
  }

  const settlements = await prisma.settlement.findMany({
    where: { groupId },
  });

  for (const settlement of settlements) {
    const amount = settlement.amount.toNumber();

    const fromBalance = balances.get(settlement.fromUserId) || 0;
    balances.set(settlement.fromUserId, fromBalance + amount);

    const toBalance = balances.get(settlement.toUserId) || 0;
    balances.set(settlement.toUserId, toBalance - amount);
  }

  return balances;
}

export async function getMemberBalances(groupId: string): Promise<MemberBalance[]> {
  const balances = await calculateGroupBalances(groupId);

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: true },
  });

  return members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    profilePicture: member.user.profilePicture,
    balance: Math.round((balances.get(member.userId) || 0) * 100) / 100,
  }));
}

export async function getUserBalance(userId: string): Promise<BalanceResponse> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: { group: true },
  });

  const groupBalances: BalanceResponse['groupBalances'] = [];
  let totalBalance = 0;

  for (const membership of memberships) {
    const balances = await calculateGroupBalances(membership.groupId);
    const balance = Math.round((balances.get(userId) || 0) * 100) / 100;

    totalBalance += balance;
    groupBalances.push({
      groupId: membership.groupId,
      groupName: membership.group.name,
      balance,
    });
  }

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    groupBalances,
  };
}

export async function getUserBalanceInGroup(userId: string, groupId: string): Promise<number> {
  const balances = await calculateGroupBalances(groupId);
  return Math.round((balances.get(userId) || 0) * 100) / 100;
}

export function calculateEqualSplit(
  totalAmount: number,
  participantIds: string[],
  payerId: string
): { userId: string; amount: Decimal }[] {
  const count = participantIds.length;
  const baseAmount = Math.floor((totalAmount / count) * 100) / 100;
  const remainder = Math.round((totalAmount - baseAmount * count) * 100) / 100;

  const payerIncluded = participantIds.includes(payerId);

  return participantIds.map((userId) => {
    let amount = baseAmount;
    if (payerIncluded && userId === payerId && remainder > 0) {
      amount = Math.round((baseAmount + remainder) * 100) / 100;
    } else if (!payerIncluded && userId === participantIds[0] && remainder > 0) {
      amount = Math.round((baseAmount + remainder) * 100) / 100;
    }
    return { userId, amount: new Decimal(amount) };
  });
}
