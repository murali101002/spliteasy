import { prisma } from '../index.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { AppError } from '../middleware/error.middleware.js';
import { getMemberBalances, getUserBalanceInGroup } from './balance.service.js';
import { config } from '../config/index.js';
import type { CreateGroupInput } from '../utils/validation.js';
import type { GroupResponse, GroupListItem, GroupDetailResponse } from '../types/api.js';

const MAX_GROUP_SIZE = 50;

function buildInviteLink(inviteCode: string): string {
  return `${config.frontendUrl}/join/${inviteCode}`;
}

export async function createGroup(userId: string, input: CreateGroupInput): Promise<GroupResponse> {
  const inviteCode = generateInviteCode();

  const group = await prisma.group.create({
    data: {
      name: input.name,
      inviteCode,
      members: {
        create: {
          userId,
        },
      },
    },
  });

  return {
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    inviteLink: buildInviteLink(group.inviteCode),
    createdAt: group.createdAt,
  };
}

export async function getGroups(userId: string): Promise<GroupListItem[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          _count: {
            select: { members: true },
          },
        },
      },
    },
    orderBy: {
      group: {
        createdAt: 'desc',
      },
    },
  });

  const groups: GroupListItem[] = [];

  for (const membership of memberships) {
    const balance = await getUserBalanceInGroup(userId, membership.groupId);
    groups.push({
      id: membership.group.id,
      name: membership.group.name,
      memberCount: membership.group._count.members,
      myBalance: balance,
      createdAt: membership.group.createdAt,
    });
  }

  return groups;
}

export async function getGroup(userId: string, groupId: string): Promise<GroupDetailResponse> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  if (!membership) {
    throw new AppError(403, 'Not a member of this group');
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  const members = await getMemberBalances(groupId);

  return {
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    inviteLink: buildInviteLink(group.inviteCode),
    members,
    createdAt: group.createdAt,
  };
}

export async function regenerateInviteCode(
  userId: string,
  groupId: string
): Promise<{ inviteCode: string; inviteLink: string }> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  if (!membership) {
    throw new AppError(403, 'Not a member of this group');
  }

  const inviteCode = generateInviteCode();

  await prisma.group.update({
    where: { id: groupId },
    data: { inviteCode },
  });

  return {
    inviteCode,
    inviteLink: buildInviteLink(inviteCode),
  };
}

export async function joinGroup(
  userId: string,
  inviteCode: string
): Promise<{ id: string; name: string; memberCount: number }> {
  const group = await prisma.group.findUnique({
    where: { inviteCode },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  if (!group) {
    throw new AppError(404, 'Invalid invite code');
  }

  const existingMembership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId: group.id },
    },
  });

  if (existingMembership) {
    throw new AppError(400, 'Already a member of this group');
  }

  if (group._count.members >= MAX_GROUP_SIZE) {
    throw new AppError(400, 'Group is full');
  }

  await prisma.groupMember.create({
    data: {
      userId,
      groupId: group.id,
    },
  });

  return {
    id: group.id,
    name: group.name,
    memberCount: group._count.members + 1,
  };
}

export async function leaveGroup(userId: string, groupId: string): Promise<void> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  if (!membership) {
    throw new AppError(403, 'Not a member of this group');
  }

  const balance = await getUserBalanceInGroup(userId, groupId);

  if (Math.abs(balance) > 0.01) {
    throw new AppError(400, 'Cannot leave group with non-zero balance');
  }

  await prisma.groupMember.delete({
    where: {
      userId_groupId: { userId, groupId },
    },
  });
}

export async function isMember(userId: string, groupId: string): Promise<boolean> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
  });

  return !!membership;
}
