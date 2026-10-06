import { Account, Category, Transaction } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', type: 'Expense', color: '#f97316' },
  { id: 'groceries', name: 'Groceries & Mart', icon: 'ShoppingBag', type: 'Expense', color: '#84cc16' },
  { id: 'transport', name: 'Fuel & Transport', icon: 'Car', type: 'Expense', color: '#06b6d4' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Zap', type: 'Expense', color: '#eab308' },
  { id: 'shopping', name: 'Shopping & Clothes', icon: 'ShoppingCart', type: 'Expense', color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment & OTT', icon: 'Film', type: 'Expense', color: '#a855f7' },
  { id: 'health', name: 'Health & Medical', icon: 'HeartPulse', type: 'Expense', color: '#ef4444' },
  { id: 'rent', name: 'Rent & Maintenance', icon: 'Home', type: 'Expense', color: '#6366f1' },
  { id: 'travel', name: 'Travel & Vacation', icon: 'Plane', type: 'Expense', color: '#14b8a6' },
  { id: 'education', name: 'Education & Courses', icon: 'GraduationCap', type: 'Expense', color: '#3b82f6' },
  { id: 'investments', name: 'Mutual Funds / SIP', icon: 'TrendingUp', type: 'Expense', color: '#10b981' },
  { id: 'other_exp', name: 'Other Expense', icon: 'MoreHorizontal', type: 'Expense', color: '#64748b' },
];

export const CREDIT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary / Monthly Pay', icon: 'Briefcase', type: 'Credit', color: '#10b981' },
  { id: 'freelance', name: 'Freelance & Projects', icon: 'Laptop', type: 'Credit', color: '#06b6d4' },
  { id: 'business', name: 'Business Income', icon: 'Building2', type: 'Credit', color: '#6366f1' },
  { id: 'interest', name: 'FD Interest / Dividend', icon: 'Percent', type: 'Credit', color: '#8b5cf6' },
  { id: 'cashback', name: 'Cashback & Rewards', icon: 'Gift', type: 'Credit', color: '#f59e0b' },
  { id: 'refund', name: 'Refund / Reimbursement', icon: 'RotateCcw', type: 'Credit', color: '#3b82f6' },
  { id: 'rental', name: 'Rental Income', icon: 'Home', type: 'Credit', color: '#14b8a6' },
  { id: 'other_cred', name: 'Other Income', icon: 'PlusCircle', type: 'Credit', color: '#64748b' },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    name: 'SBI Savings Account',
    initialBalance: 0,
    type: 'Bank',
    accountNumber: '•••• 3821',
    color: '#1e40af',
  },
  {
    name: 'SBI Credit Card',
    initialBalance: 0,
    type: 'Credit Card',
    accountNumber: '•••• 9012',
    color: '#991b1b',
  },
  {
    name: 'UPI / Wallet',
    initialBalance: 0,
    type: 'Wallet',
    accountNumber: 'UPI',
    color: '#047857',
  },
  {
    name: 'Cash',
    initialBalance: 0,
    type: 'Cash',
    accountNumber: 'CASH',
    color: '#b45309',
  },
];

// Helper to get today's date formatted as YYYY-MM-DD
export const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format currency as ₹ 12,345.00
export const formatCurrency = (amount: number, showSign = false) => {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absVal);

  if (showSign) {
    return isNegative ? `-${formatted}` : `+${formatted}`;
  }
  return formatted;
};

// Format date nicely
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Clean empty initial transactions (No mock data)
export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [];
