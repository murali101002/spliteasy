export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  inviteLink: string;
  createdAt: string;
}

export interface GroupListItem {
  id: string;
  name: string;
  memberCount: number;
  myBalance: number;
  createdAt: string;
}

export interface MemberBalance {
  id: string;
  name: string;
  profilePicture: string | null;
  balance: number;
}

export interface GroupDetail {
  id: string;
  name: string;
  inviteCode: string;
  inviteLink: string;
  members: MemberBalance[];
  createdAt: string;
}

export interface ExpenseShare {
  userId: string;
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: {
    id: string;
    name: string;
  };
  splitType: 'EQUAL' | 'EXACT';
  shares: ExpenseShare[];
  isDeleted: boolean;
  createdAt: string;
}

export interface Settlement {
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
  createdAt: string;
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

export interface CreateExpenseInput {
  description: string;
  amount: number;
  paidById: string;
  splitType: 'EQUAL' | 'EXACT';
  splitWith?: string[];
  shares?: { userId: string; amount: number }[];
}

export interface ActivityItem {
  id: string;
  type: 'expense' | 'settlement';
  description: string;
  groupName: string;
  groupId: string;
  amount: number;
  paidBy?: string;
  createdAt: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  paidById?: string;
  splitType?: 'EQUAL' | 'EXACT';
  splitWith?: string[];
  shares?: { userId: string; amount: number }[];
}
