import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as expensesApi from '@/api/expenses';
import type { CreateExpenseInput, UpdateExpenseInput } from '@/types';
import toast from 'react-hot-toast';

export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => expensesApi.getExpenses(groupId),
    enabled: !!groupId,
  });
}

export function useExpense(groupId: string, expenseId: string) {
  return useQuery({
    queryKey: ['expenses', groupId, expenseId],
    queryFn: () => expensesApi.getExpense(groupId, expenseId),
    enabled: !!groupId && !!expenseId,
  });
}

export function useCreateExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) => expensesApi.createExpense(groupId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Expense added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add expense');
    },
  });
}

export function useUpdateExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, input }: { expenseId: string; input: UpdateExpenseInput }) =>
      expensesApi.updateExpense(groupId, expenseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Expense updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });
}

export function useDeleteExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => expensesApi.deleteExpense(groupId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Expense deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete expense');
    },
  });
}
