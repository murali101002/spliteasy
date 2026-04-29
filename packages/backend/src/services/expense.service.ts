import { Decimal } from '@prisma/client/runtime/library';
import { SplitType } from '@prisma/client';
import { prisma } from '../index.js';
import { AppError } from '../middleware/error.middleware.js';
import { isMember } from './group.service.js';
import { calculateEqualSplit } from './balance.service.js';
import type { CreateExpenseInput, UpdateExpenseInput } from '../utils/validation.js';
import type { ExpenseResponse } from '../types/api.js';

function toExpenseResponse(expense: {
  id: string;
  description: string;
  amount: Decimal;
  splitType: SplitType;
  isDeleted: boolean;
  createdAt: Date;
  paidBy: { id: string; name: string };
  shares: { userId: string; amount: Decimal; user: { name: string } }[];
}): ExpenseResponse {
  return {
    id: expense.id,
    description: expense.description,
    amount: expense.amount.toNumber(),
    paidBy: {
      id: expense.paidBy.id,
      name: expense.paidBy.name,
    },
    splitType: expense.splitType,
    shares: expense.shares.map((share) => ({
      userId: share.userId,
      name: share.user.name,
      amount: share.amount.toNumber(),
    })),
    isDeleted: expense.isDeleted,
    createdAt: expense.createdAt,
  };
}

export async function createExpense(
  userId: string,
  groupId: string,
  input: CreateExpenseInput
): Promise<ExpenseResponse> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const paidByMember = await isMember(input.paidById, groupId);
  if (!paidByMember) {
    throw new AppError(400, 'Payer is not a member of this group');
  }

  let shares: { userId: string; amount: Decimal }[];

  if (input.splitType === 'EQUAL') {
    if (!input.splitWith || input.splitWith.length === 0) {
      throw new AppError(400, 'splitWith is required for equal split');
    }

    for (const participantId of input.splitWith) {
      const isParticipantMember = await isMember(participantId, groupId);
      if (!isParticipantMember) {
        throw new AppError(400, 'One or more participants are not members of this group');
      }
    }

    shares = calculateEqualSplit(input.amount, input.splitWith, input.paidById);
  } else {
    if (!input.shares || input.shares.length === 0) {
      throw new AppError(400, 'shares is required for exact split');
    }

    const totalShares = input.shares.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(totalShares - input.amount) > 0.01) {
      throw new AppError(400, 'Share amounts must equal total expense amount');
    }

    for (const share of input.shares) {
      const isParticipantMember = await isMember(share.userId, groupId);
      if (!isParticipantMember) {
        throw new AppError(400, 'One or more participants are not members of this group');
      }
    }

    shares = input.shares.map((s) => ({
      userId: s.userId,
      amount: new Decimal(s.amount),
    }));
  }

  const expense = await prisma.expense.create({
    data: {
      groupId,
      paidById: input.paidById,
      description: input.description,
      amount: new Decimal(input.amount),
      splitType: input.splitType,
      shares: {
        create: shares,
      },
    },
    include: {
      paidBy: {
        select: { id: true, name: true },
      },
      shares: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  return toExpenseResponse(expense);
}

export async function getExpenses(
  userId: string,
  groupId: string,
  options: { includeDeleted?: boolean; limit?: number; offset?: number } = {}
): Promise<{ expenses: ExpenseResponse[]; total: number }> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const { includeDeleted = true, limit = 50, offset = 0 } = options;

  const where = {
    groupId,
    ...(includeDeleted ? {} : { isDeleted: false }),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        paidBy: {
          select: { id: true, name: true },
        },
        shares: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses: expenses.map(toExpenseResponse),
    total,
  };
}

export async function getExpense(
  userId: string,
  groupId: string,
  expenseId: string
): Promise<ExpenseResponse> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      paidBy: {
        select: { id: true, name: true },
      },
      shares: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!expense || expense.groupId !== groupId) {
    throw new AppError(404, 'Expense not found');
  }

  return toExpenseResponse(expense);
}

export async function updateExpense(
  userId: string,
  groupId: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<ExpenseResponse> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const existingExpense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!existingExpense || existingExpense.groupId !== groupId) {
    throw new AppError(404, 'Expense not found');
  }

  if (existingExpense.isDeleted) {
    throw new AppError(400, 'Cannot edit deleted expense');
  }

  const updateData: {
    description?: string;
    amount?: Decimal;
    paidById?: string;
    splitType?: SplitType;
  } = {};

  if (input.description !== undefined) {
    updateData.description = input.description;
  }

  if (input.amount !== undefined) {
    updateData.amount = new Decimal(input.amount);
  }

  if (input.paidById !== undefined) {
    const paidByMember = await isMember(input.paidById, groupId);
    if (!paidByMember) {
      throw new AppError(400, 'Payer is not a member of this group');
    }
    updateData.paidById = input.paidById;
  }

  if (input.splitType !== undefined) {
    updateData.splitType = input.splitType;
  }

  const finalAmount = input.amount ?? existingExpense.amount.toNumber();
  const finalSplitType = input.splitType ?? existingExpense.splitType;
  const finalPaidById = input.paidById ?? existingExpense.paidById;

  let newShares: { userId: string; amount: Decimal }[] | null = null;

  if (input.splitType || input.splitWith || input.shares || input.amount) {
    if (finalSplitType === 'EQUAL') {
      if (!input.splitWith) {
        throw new AppError(400, 'splitWith is required when changing to equal split');
      }

      for (const participantId of input.splitWith) {
        const isParticipantMember = await isMember(participantId, groupId);
        if (!isParticipantMember) {
          throw new AppError(400, 'One or more participants are not members of this group');
        }
      }

      newShares = calculateEqualSplit(finalAmount, input.splitWith, finalPaidById);
    } else {
      if (!input.shares) {
        throw new AppError(400, 'shares is required when changing to exact split');
      }

      const totalShares = input.shares.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalShares - finalAmount) > 0.01) {
        throw new AppError(400, 'Share amounts must equal total expense amount');
      }

      for (const share of input.shares) {
        const isParticipantMember = await isMember(share.userId, groupId);
        if (!isParticipantMember) {
          throw new AppError(400, 'One or more participants are not members of this group');
        }
      }

      newShares = input.shares.map((s) => ({
        userId: s.userId,
        amount: new Decimal(s.amount),
      }));
    }
  }

  const expense = await prisma.$transaction(async (tx) => {
    if (newShares) {
      await tx.expenseShare.deleteMany({
        where: { expenseId },
      });

      await tx.expenseShare.createMany({
        data: newShares.map((share) => ({
          expenseId,
          userId: share.userId,
          amount: share.amount,
        })),
      });
    }

    return tx.expense.update({
      where: { id: expenseId },
      data: updateData,
      include: {
        paidBy: {
          select: { id: true, name: true },
        },
        shares: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });
  });

  return toExpenseResponse(expense);
}

export async function deleteExpense(
  userId: string,
  groupId: string,
  expenseId: string
): Promise<void> {
  const memberCheck = await isMember(userId, groupId);
  if (!memberCheck) {
    throw new AppError(403, 'Not a member of this group');
  }

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || expense.groupId !== groupId) {
    throw new AppError(404, 'Expense not found');
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: { isDeleted: true },
  });
}
