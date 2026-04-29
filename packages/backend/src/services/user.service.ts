import { User } from '@prisma/client';
import { prisma } from '../index.js';
import type { UpdateProfileInput } from '../utils/validation.js';
import type { UserResponse } from '../types/api.js';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture,
  };
}

export async function getProfile(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  return toUserResponse(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.profilePicture !== undefined && { profilePicture: input.profilePicture }),
    },
  });

  return toUserResponse(user);
}
