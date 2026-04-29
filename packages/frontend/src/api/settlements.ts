import { api } from './client';
import type { Settlement, SettleSuggestion } from '@/types';

export async function getSettleSuggestions(groupId: string): Promise<SettleSuggestion[]> {
  const { data } = await api.get<{ suggestions: SettleSuggestion[] }>(`/groups/${groupId}/settle-suggestions`);
  return data.suggestions;
}

export async function createSettlement(groupId: string, toUserId: string, amount: number): Promise<Settlement> {
  const { data } = await api.post<Settlement>(`/groups/${groupId}/settlements`, { toUserId, amount });
  return data;
}

export async function getSettlements(groupId: string): Promise<Settlement[]> {
  const { data } = await api.get<{ settlements: Settlement[] }>(`/groups/${groupId}/settlements`);
  return data.settlements;
}
