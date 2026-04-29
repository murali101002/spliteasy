import { SplitType } from '@prisma/client';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  inviteCode: string;
  inviteLink: string;
  createdAt: Date;
}

export interface GroupListItem {
  id: string;
  name: string;
  memberCount: number;
  myBalance: number;
  createdAt: Date;
}

export interface MemberBalance {
  id: string;
  name: string;
  profilePicture: string | null;
  balance: number;
}

export interface GroupDetailResponse {
  id: string;
  name: string;
  inviteCode: string;
  inviteLink: string;
  members: MemberBalance[];
  createdAt: Date;
}

export interface ExpenseShareResponse {
  userId: string;
  name: string;
  amount: number;
}

export interface ExpenseResponse {
  id: string;
  description: string;
  amount: number;
  paidBy: {
    id: string;
    name: string;
  };
  splitType: SplitType;
  shares: ExpenseShareResponse[];
  isDeleted: boolean;
  createdAt: Date;
}

export interface SettlementResponse {
  id: string;
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: number;
  createdAt: Date;
}

export interface SettleSuggestion {
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: number;
}

export interface BalanceResponse {
  totalBalance: number;
  groupBalances: {
    groupId: string;
    groupName: string;
    balance: number;
  }[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
