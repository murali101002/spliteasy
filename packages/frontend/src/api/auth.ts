import { api } from './client';
import type { AuthResponse, User } from '@/types';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  return data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password });
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}

export async function updateProfile(input: { name?: string; profilePicture?: string | null }): Promise<User> {
  const { data } = await api.patch<User>('/users/me', input);
  return data;
}
