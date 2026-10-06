export type TransactionType = 'Expense' | 'Credit';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  account: string;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface Account {
  name: string;
  initialBalance: number;
  type: 'Bank' | 'Credit Card' | 'Wallet' | 'Cash' | 'Investment';
  accountNumber?: string;
  color?: string;
  currentBalance?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType | 'Both';
  color: string;
}

export interface MonthlySummary {
  month: string; // "Jan 2026", "2026-01"
  income: number;
  expense: number;
  net: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface FilterState {
  search: string;
  category: string;
  account: string;
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}
