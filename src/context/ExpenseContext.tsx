'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Transaction, Account, TransactionType, CategorySummary, MonthlySummary } from '../types';
import { DEFAULT_ACCOUNTS } from '../utils/constants';
import {
  getStoredScriptUrl,
  setStoredScriptUrl,
  fetchFromGoogleSheet,
  addTransactionToSheet,
  deleteTransactionFromSheet,
  transferBetweenAccountsInSheet,
  syncAccountsToSheet,
  LOCAL_TX_KEY,
  LOCAL_ACCOUNTS_KEY,
} from '../services/api';

interface ExpenseContextType {
  transactions: Transaction[];
  accounts: Account[];
  isLoading: boolean;
  isSyncing: boolean;
  scriptUrl: string;
  isConnected: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  // Modal states
  isTransactionModalOpen: boolean;
  modalTransactionType: 'Expense' | 'Credit' | 'Transfer';
  isSettingsModalOpen: boolean;
  isAccountModalOpen: boolean;
  editingAccount: Account | null;
  // Actions
  openTransactionModal: (type?: 'Expense' | 'Credit' | 'Transfer') => void;
  closeTransactionModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openAccountModal: (accountToEdit?: Account) => void;
  closeAccountModal: () => void;
  updateScriptUrl: (url: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearAllData: () => void;
  // Transaction actions
  addTransaction: (tx: {
    date: string;
    type: TransactionType;
    category: string;
    account: string;
    amount: number;
    note?: string;
  }) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  transferMoney: (fromAccount: string, toAccount: string, amount: number, note?: string, date?: string) => Promise<boolean>;
  // Account / Payment Mode actions
  addAccount: (acc: Account) => Promise<boolean>;
  updateAccount: (oldName: string, updatedAcc: Account) => Promise<boolean>;
  deleteAccount: (name: string) => Promise<boolean>;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  // Computed Stats
  totalCredit: number;
  totalExpense: number;
  netBalance: number;
  expenseCategoriesSummary: CategorySummary[];
  creditCategoriesSummary: CategorySummary[];
  monthlySummaries: MonthlySummary[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [scriptUrl, setScriptUrlState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [modalTransactionType, setModalTransactionType] = useState<'Expense' | 'Credit' | 'Transfer'>('Expense');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Initial Load - Clean start, filter out any demo data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const url = getStoredScriptUrl();
      setScriptUrlState(url);

      const cachedTx = localStorage.getItem(LOCAL_TX_KEY);
      const cachedAcc = localStorage.getItem(LOCAL_ACCOUNTS_KEY);

      let currentTx: Transaction[] = [];
      let currentAcc: Account[] = DEFAULT_ACCOUNTS;

      if (cachedTx) {
        try {
          const parsed = JSON.parse(cachedTx);
          currentTx = Array.isArray(parsed) ? parsed.filter((t: Transaction) => !t.id?.startsWith('tx_demo_')) : [];
        } catch {
          currentTx = [];
        }
      }

      if (cachedAcc) {
        try {
          currentAcc = JSON.parse(cachedAcc);
        } catch {
          currentAcc = DEFAULT_ACCOUNTS;
        }
      }

      setTransactions(currentTx);
      setAccounts(currentAcc);
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(currentTx));
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(currentAcc));

      // If URL exists, fetch fresh sheet data
      if (url) {
        setIsSyncing(true);
        const sheetData = await fetchFromGoogleSheet(url);
        if (sheetData) {
          setTransactions(sheetData.transactions || []);
          localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(sheetData.transactions || []));
          
          if (sheetData.accounts && sheetData.accounts.length > 0) {
            setAccounts(sheetData.accounts);
            localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(sheetData.accounts));
          }
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
        setIsSyncing(false);
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const clearAllData = () => {
    setTransactions([]);
    setAccounts(DEFAULT_ACCOUNTS);
    localStorage.removeItem(LOCAL_TX_KEY);
    localStorage.removeItem(LOCAL_ACCOUNTS_KEY);
    showToast('All transaction records cleared.', 'info');
  };

  const refreshData = async () => {
    if (!scriptUrl) {
      showToast('No Google Apps Script URL configured. Operating locally.', 'info');
      return;
    }
    setIsSyncing(true);
    const sheetData = await fetchFromGoogleSheet(scriptUrl);
    if (sheetData) {
      setTransactions(sheetData.transactions || []);
      if (sheetData.accounts && sheetData.accounts.length > 0) {
        setAccounts(sheetData.accounts);
      }
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(sheetData.transactions || []));
      setIsConnected(true);
      showToast('Data refreshed from Google Sheet!', 'success');
    } else {
      setIsConnected(false);
      showToast('Failed to sync with Google Sheet. Please check the Web App URL.', 'error');
    }
    setIsSyncing(false);
  };

  const updateScriptUrl = async (url: string): Promise<boolean> => {
    setStoredScriptUrl(url);
    setScriptUrlState(url);
    if (!url) {
      setIsConnected(false);
      return true;
    }
    setIsSyncing(true);
    const sheetData = await fetchFromGoogleSheet(url);
    if (sheetData) {
      setTransactions(sheetData.transactions || []);
      if (sheetData.accounts && sheetData.accounts.length > 0) {
        setAccounts(sheetData.accounts);
      }
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(sheetData.transactions || []));
      setIsConnected(true);
      setIsSyncing(false);
      showToast('Successfully linked Google Sheet!', 'success');
      return true;
    } else {
      setIsConnected(false);
      setIsSyncing(false);
      showToast('Connection failed. Verify Web App deployment settings.', 'error');
      return false;
    }
  };

  // Add Transaction
  const addTransaction = async (txData: {
    date: string;
    type: TransactionType;
    category: string;
    account: string;
    amount: number;
    note?: string;
  }): Promise<boolean> => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      date: txData.date,
      type: txData.type,
      category: txData.category,
      account: txData.account,
      amount: Math.abs(txData.amount),
      note: txData.note || '',
      createdAt: new Date().toISOString(),
    };

    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(updatedTransactions));
    showToast(`${txData.type} of ₹${txData.amount.toLocaleString('en-IN')} recorded!`, 'success');

    if (scriptUrl) {
      setIsSyncing(true);
      addTransactionToSheet(scriptUrl, newTx).then((res) => {
        setIsSyncing(false);
        if (!res) {
          showToast('Saved locally. Could not sync with Google Sheets.', 'info');
        }
      });
    }

    return true;
  };

  // Delete Transaction
  const deleteTransaction = async (id: string): Promise<boolean> => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(updated));
    showToast('Transaction deleted', 'info');

    if (scriptUrl) {
      setIsSyncing(true);
      deleteTransactionFromSheet(scriptUrl, id).finally(() => {
        setIsSyncing(false);
      });
    }
    return true;
  };

  // Transfer Money between accounts
  const transferMoney = async (
    fromAccount: string,
    toAccount: string,
    amount: number,
    note?: string,
    date?: string
  ): Promise<boolean> => {
    const today = date || new Date().toISOString().split('T')[0];
    const transferNote = note ? `Transfer: ${note}` : `Transfer to ${toAccount}`;
    const receiveNote = note ? `Transfer: ${note}` : `Transfer from ${fromAccount}`;

    const debitTx: Transaction = {
      id: `tx_tr_out_${Date.now()}`,
      date: today,
      type: 'Expense',
      category: 'Transfer / Move Money',
      account: fromAccount,
      amount: amount,
      note: transferNote,
      createdAt: new Date().toISOString(),
    };

    const creditTx: Transaction = {
      id: `tx_tr_in_${Date.now() + 1}`,
      date: today,
      type: 'Credit',
      category: 'Transfer / Move Money',
      account: toAccount,
      amount: amount,
      note: receiveNote,
      createdAt: new Date().toISOString(),
    };

    const updated = [debitTx, creditTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(updated));
    showToast(`Transferred ₹${amount.toLocaleString('en-IN')} from ${fromAccount} to ${toAccount}`, 'success');

    if (scriptUrl) {
      setIsSyncing(true);
      transferBetweenAccountsInSheet(scriptUrl, {
        fromAccount,
        toAccount,
        amount,
        date: today,
        note: note || '',
      }).finally(() => {
        setIsSyncing(false);
      });
    }
    return true;
  };

  // ==========================================
  // ACCOUNT / PAYMENT MODE MANAGEMENT ACTIONS
  // ==========================================
  const addAccount = async (newAcc: Account): Promise<boolean> => {
    if (accounts.some((a) => a.name.toLowerCase() === newAcc.name.toLowerCase())) {
      showToast('A payment mode with this name already exists', 'error');
      return false;
    }

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updated));
    showToast(`Payment mode "${newAcc.name}" created!`, 'success');

    if (scriptUrl) {
      setIsSyncing(true);
      syncAccountsToSheet(scriptUrl, updated)
        .then((success) => {
          if (!success) {
            showToast('Saved locally. Please ensure Google Apps Script is updated & redeployed.', 'warning');
          }
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
    return true;
  };

  const updateAccount = async (oldName: string, updatedAcc: Account): Promise<boolean> => {
    const updatedAccounts = accounts.map((a) => (a.name === oldName ? updatedAcc : a));
    
    // Also rename any existing transactions referencing old name
    let updatedTx = transactions;
    if (oldName !== updatedAcc.name) {
      updatedTx = transactions.map((t) => (t.account === oldName ? { ...t, account: updatedAcc.name } : t));
      setTransactions(updatedTx);
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(updatedTx));
    }

    setAccounts(updatedAccounts);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
    showToast(`Payment mode "${updatedAcc.name}" updated!`, 'success');

    if (scriptUrl) {
      setIsSyncing(true);
      syncAccountsToSheet(scriptUrl, updatedAccounts, { oldName, newName: updatedAcc.name })
        .then((success) => {
          if (!success) {
            showToast('Saved locally. Please ensure Google Apps Script is updated & redeployed.', 'warning');
          }
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
    return true;
  };

  const deleteAccount = async (name: string): Promise<boolean> => {
    if (accounts.length <= 1) {
      showToast('You must have at least one payment mode', 'error');
      return false;
    }

    const updated = accounts.filter((a) => a.name !== name);
    setAccounts(updated);
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updated));
    showToast(`Payment mode "${name}" deleted`, 'info');

    if (scriptUrl) {
      setIsSyncing(true);
      syncAccountsToSheet(scriptUrl, updated)
        .then((success) => {
          if (!success) {
            showToast('Saved locally. Please ensure Google Apps Script is updated & redeployed.', 'warning');
          }
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
    return true;
  };

  const openAccountModal = (accountToEdit?: Account) => {
    setEditingAccount(accountToEdit || null);
    setIsAccountModalOpen(true);
  };

  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };

  const openTransactionModal = (type: 'Expense' | 'Credit' | 'Transfer' = 'Expense') => {
    setModalTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
  };

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  // Compute live account balances
  const accountsWithLiveBalances = useMemo(() => {
    return accounts.map((acc) => {
      let balance = acc.initialBalance || 0;
      transactions.forEach((tx) => {
        if (tx.account === acc.name) {
          if (tx.type === 'Credit') {
            balance += tx.amount;
          } else if (tx.type === 'Expense') {
            balance -= tx.amount;
          }
        }
      });
      return {
        ...acc,
        currentBalance: balance,
      };
    });
  }, [accounts, transactions]);

  // Compute Total Credit, Total Expense, Net Balance
  const { totalCredit, totalExpense, netBalance } = useMemo(() => {
    let credit = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'Credit') credit += t.amount;
      if (t.type === 'Expense') expense += t.amount;
    });
    return {
      totalCredit: credit,
      totalExpense: expense,
      netBalance: credit - expense,
    };
  }, [transactions]);

  // Expense Categories Summary
  const expenseCategoriesSummary = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    let total = 0;

    transactions
      .filter((t) => t.type === 'Expense')
      .forEach((t) => {
        total += t.amount;
        if (!map[t.category]) {
          map[t.category] = { amount: 0, count: 0 };
        }
        map[t.category].amount += t.amount;
        map[t.category].count += 1;
      });

    const colors = [
      '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1',
      '#3b82f6', '#06b6d4', '#14b8a6', '#10b981', '#eab308'
    ];

    return Object.entries(map)
      .map(([cat, val], idx) => ({
        category: cat,
        amount: val.amount,
        count: val.count,
        percentage: total > 0 ? (val.amount / total) * 100 : 0,
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Credit Categories Summary
  const creditCategoriesSummary = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    let total = 0;

    transactions
      .filter((t) => t.type === 'Credit')
      .forEach((t) => {
        total += t.amount;
        if (!map[t.category]) {
          map[t.category] = { amount: 0, count: 0 };
        }
        map[t.category].amount += t.amount;
        map[t.category].count += 1;
      });

    const colors = ['#10b981', '#06b6d4', '#6366f1', '#8b5cf6', '#f59e0b', '#3b82f6', '#14b8a6'];

    return Object.entries(map)
      .map(([cat, val], idx) => ({
        category: cat,
        amount: val.amount,
        count: val.count,
        percentage: total > 0 ? (val.amount / total) * 100 : 0,
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Monthly summary breakdown
  const monthlySummaries = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((tx) => {
      const date = tx.date ? new Date(tx.date) : new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map[monthKey]) {
        map[monthKey] = { income: 0, expense: 0 };
      }
      if (tx.type === 'Credit') {
        map[monthKey].income += tx.amount;
      } else {
        map[monthKey].expense += tx.amount;
      }
    });

    const keys = Object.keys(map).sort();
    return keys.map((key) => {
      const [year, month] = key.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      return {
        month: label,
        income: map[key].income,
        expense: map[key].expense,
        net: map[key].income - map[key].expense,
      };
    });
  }, [transactions]);

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        accounts: accountsWithLiveBalances,
        isLoading,
        isSyncing,
        scriptUrl,
        isConnected,
        toast,
        isTransactionModalOpen,
        modalTransactionType,
        isSettingsModalOpen,
        isAccountModalOpen,
        editingAccount,
        openTransactionModal,
        closeTransactionModal,
        openSettingsModal,
        closeSettingsModal,
        openAccountModal,
        closeAccountModal,
        updateScriptUrl,
        refreshData,
        clearAllData,
        addTransaction,
        deleteTransaction,
        transferMoney,
        addAccount,
        updateAccount,
        deleteAccount,
        showToast,
        totalCredit,
        totalExpense,
        netBalance,
        expenseCategoriesSummary,
        creditCategoriesSummary,
        monthlySummaries,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
