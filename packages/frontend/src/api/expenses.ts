import { api } from './client';
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/types';

export interface GetExpensesResponse {
  expenses: Expense[];
  total: number;
  limit: number;
  offset: number;
}

export async function getExpenses(
  groupId: string,
  options?: { includeDeleted?: boolean; limit?: number; offset?: number }
): Promise<GetExpensesResponse> {
  const params = new URLSearchParams();
  if (options?.includeDeleted !== undefined) {
    params.set('includeDeleted', String(options.includeDeleted));
  }
  if (options?.limit !== undefined) {
    params.set('limit', String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.set('offset', String(options.offset));
  }
  const { data } = await api.get<GetExpensesResponse>(`/groups/${groupId}/expenses?${params}`);
  return data;
}

export async function getExpense(groupId: string, expenseId: string): Promise<Expense> {
  const { data } = await api.get<Expense>(`/groups/${groupId}/expenses/${expenseId}`);
  return data;
}

export async function createExpense(groupId: string, input: CreateExpenseInput): Promise<Expense> {
  const { data } = await api.post<Expense>(`/groups/${groupId}/expenses`, input);
  return data;
}

export async function updateExpense(groupId: string, expenseId: string, input: UpdateExpenseInput): Promise<Expense> {
  const { data } = await api.patch<Expense>(`/groups/${groupId}/expenses/${expenseId}`, input);
  return data;
}

export async function deleteExpense(groupId: string, expenseId: string): Promise<void> {
  await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
}
