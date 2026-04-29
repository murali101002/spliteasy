import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as groupsApi from '@/api/groups';
import * as expensesApi from '@/api/expenses';
import type { ActivityItem } from '@/types';
import toast from 'react-hot-toast';

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.getGroup(id),
    enabled: !!id,
  });
}

export function useUserBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: groupsApi.getUserBalance,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => groupsApi.createGroup(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create group');
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteCode: string) => groupsApi.joinGroup(inviteCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success(`Joined ${data.name}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join group');
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupsApi.leaveGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Left group');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to leave group');
    },
  });
}

export function useRegenerateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupsApi.regenerateInvite(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      toast.success('New invite link generated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to regenerate invite');
    },
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['activity', limit],
    queryFn: async () => {
      const groups = await groupsApi.getGroups();
      if (groups.length === 0) return [];

      const expenseResults = await Promise.all(
        groups.map((g) => expensesApi.getExpenses(g.id, { includeDeleted: false, limit: 10 }))
      );

      const activities: ActivityItem[] = [];
      for (let i = 0; i < groups.length; i++) {
        for (const expense of expenseResults[i].expenses) {
          activities.push({
            id: expense.id,
            type: 'expense' as const,
            description: expense.description,
            groupName: groups[i].name,
            groupId: groups[i].id,
            amount: expense.amount,
            paidBy: expense.paidBy.name,
            createdAt: expense.createdAt,
          });
        }
      }

      activities.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return activities.slice(0, limit);
    },
    staleTime: 60_000,
  });
}
