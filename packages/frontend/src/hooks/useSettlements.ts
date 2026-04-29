import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settlementsApi from '@/api/settlements';
import toast from 'react-hot-toast';

export function useSettleSuggestions(groupId: string) {
  return useQuery({
    queryKey: ['settlements', groupId, 'suggestions'],
    queryFn: () => settlementsApi.getSettleSuggestions(groupId),
    enabled: !!groupId,
  });
}

export function useSettlements(groupId: string) {
  return useQuery({
    queryKey: ['settlements', groupId],
    queryFn: () => settlementsApi.getSettlements(groupId),
    enabled: !!groupId,
  });
}

export function useCreateSettlement(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ toUserId, amount }: { toUserId: string; amount: number }) =>
      settlementsApi.createSettlement(groupId, toUserId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Payment recorded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
}
