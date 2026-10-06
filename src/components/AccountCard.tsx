'use client';

import React from 'react';
import { Account } from '../types';
import { formatCurrency } from '../utils/constants';
import { useExpense } from '../context/ExpenseContext';
import { Plus, ArrowRightLeft, CreditCard, Building2, Smartphone, Banknote } from 'lucide-react';

interface AccountCardProps {
  account: Account;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { openTransactionModal } = useExpense();

  const getAccountTheme = () => {
    switch (account.type) {
      case 'Bank':
        return {
          gradient: 'from-blue-900 via-blue-800 to-indigo-900 shadow-blue-500/20',
          border: 'border-blue-400/40 hover:border-blue-300',
          badge: 'bg-white/20 text-blue-100 border-white/30',
          icon: Building2,
          chipColor: 'bg-amber-300',
        };
      case 'Credit Card':
        return {
          gradient: 'from-rose-900 via-rose-800 to-red-950 shadow-rose-500/20',
          border: 'border-rose-400/40 hover:border-rose-300',
          badge: 'bg-white/20 text-rose-100 border-white/30',
          icon: CreditCard,
          chipColor: 'bg-amber-200',
        };
      case 'Wallet':
        return {
          gradient: 'from-emerald-900 via-emerald-800 to-teal-950 shadow-emerald-500/20',
          border: 'border-emerald-400/40 hover:border-emerald-300',
          badge: 'bg-white/20 text-emerald-100 border-white/30',
          icon: Smartphone,
          chipColor: 'bg-emerald-300',
        };
      default:
        return {
          gradient: 'from-amber-900 via-amber-800 to-yellow-950 shadow-amber-500/20',
          border: 'border-amber-400/40 hover:border-amber-300',
          badge: 'bg-white/20 text-amber-100 border-white/30',
          icon: Banknote,
          chipColor: 'bg-yellow-300',
        };
    }
  };

  const theme = getAccountTheme();
  const Icon = theme.icon;
  const balance = account.currentBalance ?? account.initialBalance;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} border ${theme.border} p-5 text-white flex flex-col justify-between shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div>
        {/* Top bar: Bank header + Account Type badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs tracking-wider text-white/95 uppercase font-mono">
              {account.type === 'Bank' || account.type === 'Credit Card' ? 'STATE BANK OF INDIA' : 'ACCOUNT LEDGER'}
            </span>
          </div>
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider backdrop-blur-md ${theme.badge}`}>
            {account.type}
          </div>
        </div>

        {/* EMV Chip & Contactless indicator */}
        <div className="flex items-center justify-between mb-5">
          <div className="w-9 h-6 rounded-md bg-amber-400 border border-amber-300 flex items-center justify-center shadow-inner">
            <div className="w-6 h-3 border border-amber-700/60 rounded-sm grid grid-cols-2 gap-0.5">
              <div className="border-r border-amber-700/60" />
              <div />
            </div>
          </div>
          <Icon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
        </div>

        {/* Account Number */}
        <div className="mb-4">
          <p className="typo-label text-[10px] text-white/70">Account / Masked Number</p>
          <p className="font-mono text-sm tracking-widest text-white font-bold mt-0.5">
            {account.accountNumber || '•••• •••• •••• 0000'}
          </p>
        </div>
      </div>

      {/* Balance & Actions */}
      <div className="pt-3 border-t border-white/15 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{account.name}</p>
          <div className="typo-num text-2xl font-black text-white mt-0.5 tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openTransactionModal('Expense')}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white border border-white/20 text-xs transition-colors shadow-sm"
            title="Log Expense"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openTransactionModal('Transfer')}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white border border-white/20 text-xs transition-colors shadow-sm"
            title="Transfer from/to this account"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
