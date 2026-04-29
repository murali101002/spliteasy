import { User } from '@prisma/client';
import { prisma } from '../index.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { generateResetToken } from '../utils/inviteCode.js';
import { sendPasswordResetEmail } from './email.service.js';
import { AppError } from '../middleware/error.middleware.js';
import type { RegisterInput, LoginInput } from '../utils/validation.js';
import type { AuthResponse, UserResponse } from '../types/api.js';

function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture,
  };
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const passwordValidation = validatePasswordStrength(input.password);
  if (!passwordValidation.valid) {
    throw new AppError(400, passwordValidation.message!);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
    },
  });

  const token = generateToken(user.id);

  return {
    user: toUserResponse(user),
    token,
  };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id);

  return {
    user: toUserResponse(user),
    token,
  };
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return;
  }

  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  await sendPasswordResetEmail(user.email, resetToken);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.valid) {
    throw new AppError(400, passwordValidation.message!);
  }

  const user = await prisma.user.findUnique({
    where: { resetToken: token },
  });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw new AppError(400, 'Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}
