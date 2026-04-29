import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../index.js';
import { AppError } from '../middleware/error.middleware.js';
import { isMember } from './group.service.js';
import { calculateGroupBalances } from './balance.service.js';
import { simplifyDebts } from '../utils/debtSimplifier.js';
import type { CreateSettlementInput } from '../utils/validation.js';
import type { SettlementResponse, SettleSuggestion } from '../types/api.js';

export async function getSettleSuggestions(
  userId: string,
  groupId: string
): Promise<SettleSuggestion[]> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const balances = await calculateGroupBalances(groupId);
  const simplifiedDebts = simplifyDebts(balances);

  const userIds = new Set<string>();
  for (const debt of simplifiedDebts) {
    userIds.add(debt.fromUserId);
    userIds.add(debt.toUserId);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: { id: true, name: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return simplifiedDebts.map((debt) => ({
    from: {
      id: debt.fromUserId,
      name: userMap.get(debt.fromUserId)?.name || 'Unknown',
    },
    to: {
      id: debt.toUserId,
      name: userMap.get(debt.toUserId)?.name || 'Unknown',
    },
    amount: debt.amount,
  }));
}

export async function createSettlement(
  userId: string,
  groupId: string,
  input: CreateSettlementInput
): Promise<SettlementResponse> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const toUserMember = await isMember(input.toUserId, groupId);
  if (!toUserMember) {
    throw new AppError(400, 'Recipient is not a member of this group');
  }

  if (userId === input.toUserId) {
    throw new AppError(400, 'Cannot settle with yourself');
  }

  const settlement = await prisma.settlement.create({
    data: {
      groupId,
      fromUserId: userId,
      toUserId: input.toUserId,
      amount: new Decimal(input.amount),
    },
    include: {
      fromUser: {
        select: { id: true, name: true },
      },
      toUser: {
        select: { id: true, name: true },
      },
    },
  });

  return {
    id: settlement.id,
    from: {
      id: settlement.fromUser.id,
      name: settlement.fromUser.name,
    },
    to: {
      id: settlement.toUser.id,
      name: settlement.toUser.name,
    },
    amount: settlement.amount.toNumber(),
    createdAt: settlement.createdAt,
  };
}

export async function getSettlements(
  userId: string,
  groupId: string
): Promise<SettlementResponse[]> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    include: {
      fromUser: {
        select: { id: true, name: true },
      },
      toUser: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return settlements.map((settlement) => ({
    id: settlement.id,
    from: {
      id: settlement.fromUser.id,
      name: settlement.fromUser.name,
    },
    to: {
      id: settlement.toUser.id,
      name: settlement.toUser.name,
    },
    amount: settlement.amount.toNumber(),
    createdAt: settlement.createdAt,
  }));
}
