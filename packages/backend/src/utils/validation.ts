import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profilePicture: z.string().url().nullable().optional(),
});

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(50, 'Group name too long'),
});

export const createExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100, 'Description too long'),
  amount: z.number().positive('Amount must be positive'),
  paidById: z.string().uuid('Invalid user ID'),
  splitType: z.enum(['EQUAL', 'EXACT']),
  splitWith: z.array(z.string().uuid()).optional(),
  shares: z
    .array(
      z.object({
        userId: z.string().uuid(),
        amount: z.number().positive(),
      })
    )
    .optional(),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  paidById: z.string().uuid().optional(),
  splitType: z.enum(['EQUAL', 'EXACT']).optional(),
  splitWith: z.array(z.string().uuid()).optional(),
  shares: z
    .array(
      z.object({
        userId: z.string().uuid(),
        amount: z.number().positive(),
      })
    )
    .optional(),
});

export const createSettlementSchema = z.object({
  toUserId: z.string().uuid('Invalid user ID'),
  amount: z.number().positive('Amount must be positive'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
