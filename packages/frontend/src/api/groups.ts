import { api } from './client';
import type { Group, GroupListItem, GroupDetail, BalanceResponse } from '@/types';

export async function createGroup(name: string): Promise<Group> {
  const { data } = await api.post<Group>('/groups', { name });
  return data;
}

export async function getGroups(): Promise<GroupListItem[]> {
  const { data } = await api.get<{ groups: GroupListItem[] }>('/groups');
  return data.groups;
}

export async function getGroup(id: string): Promise<GroupDetail> {
  const { data } = await api.get<GroupDetail>(`/groups/${id}`);
  return data;
}

export async function regenerateInvite(id: string): Promise<{ inviteCode: string; inviteLink: string }> {
  const { data } = await api.post<{ inviteCode: string; inviteLink: string }>(`/groups/${id}/regenerate-invite`);
  return data;
}

export async function joinGroup(inviteCode: string): Promise<{ id: string; name: string; memberCount: number }> {
  const { data } = await api.post<{ id: string; name: string; memberCount: number }>(`/groups/join/${inviteCode}`);
  return data;
}

export async function leaveGroup(id: string): Promise<void> {
  await api.delete(`/groups/${id}/leave`);
}

export async function getUserBalance(): Promise<BalanceResponse> {
  const { data } = await api.get<BalanceResponse>('/users/me/balance');
  return data;
}
