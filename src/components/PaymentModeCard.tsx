'use client';

import React from 'react';
import { Account } from '../types';
import { formatCurrency } from '../utils/constants';
import { useExpense } from '../context/ExpenseContext';
import {
  Smartphone,
  Building2,
  CreditCard,
  Banknote,
  Plus,
  ArrowRightLeft,
  QrCode,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2
} from 'lucide-react';

interface PaymentModeCardProps {
  account: Account & {
    totalCredits?: number;
    totalDebits?: number;
    transactionCount?: number;
  };
  totalBalance?: number;
}

export const PaymentModeCard: React.FC<PaymentModeCardProps> = ({ account, totalBalance = 0 }) => {
  const { openTransactionModal, openAccountModal, deleteAccount } = useExpense();

  const getModeDetails = () => {
    switch (account.type) {
      case 'Bank':
        return {
          icon: Building2,
          tag: 'NET BANKING / IMPS',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          iconBox: 'bg-blue-50 text-blue-600 border border-blue-200',
          accentBorder: 'hover:border-blue-300',
          progressColor: 'bg-blue-600',
        };
      case 'Credit Card':
        return {
          icon: CreditCard,
          tag: 'CREDIT LINE / CC',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          iconBox: 'bg-rose-50 text-rose-600 border border-rose-200',
          accentBorder: 'hover:border-rose-300',
          progressColor: 'bg-rose-600',
        };
      case 'Wallet':
        return {
          icon: QrCode,
          tag: 'UPI / SCAN & PAY',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
          accentBorder: 'hover:border-emerald-300',
          progressColor: 'bg-emerald-600',
        };
      default:
        return {
          icon: Banknote,
          tag: 'CASH ON HAND',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          iconBox: 'bg-amber-50 text-amber-600 border border-amber-200',
          accentBorder: 'hover:border-amber-300',
          progressColor: 'bg-amber-600',
        };
    }
  };

  const details = getModeDetails();
  const Icon = details.icon;
  const balance = account.currentBalance ?? account.initialBalance;
  const share = totalBalance > 0 ? Math.max(0, (balance / totalBalance) * 100) : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete payment mode "${account.name}"?`)) {
      deleteAccount(account.name);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAccountModal(account);
  };

  return (
    <div
      className={`bento-card p-5 flex flex-col justify-between ${details.accentBorder} transition-all duration-200 group relative overflow-hidden`}
    >
      <div>
        {/* Top Header: Mode Icon, Name, and Edit/Delete Actions */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${details.iconBox} shadow-sm`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                {account.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {account.accountNumber || 'Primary Mode'}
              </p>
            </div>
          </div>

          {/* Top Actions: Edit / Delete & Tag */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit Payment Mode"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Payment Mode"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Badge */}
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase tracking-wider ${details.badgeClass}`}
          >
            {details.tag}
          </span>
        </div>

        {/* Current Balance */}
        <div className="my-2.5">
          <p className="typo-label text-[10px] text-slate-500">AVAILABLE BALANCE</p>
          <div className="typo-num text-2xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
            {formatCurrency(balance)}
          </div>
        </div>

        {/* Inflow / Outflow summary tags if present */}
        {(account.totalCredits !== undefined || account.totalDebits !== undefined) && (
          <div className="flex items-center gap-2 pt-1 pb-2 text-[11px] font-mono">
            {account.totalCredits !== undefined && account.totalCredits > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <TrendingUp className="w-3 h-3" />
                <span>+{formatCurrency(account.totalCredits)}</span>
              </span>
            )}
            {account.totalDebits !== undefined && account.totalDebits > 0 && (
              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                <TrendingDown className="w-3 h-3" />
                <span>-{formatCurrency(account.totalDebits)}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Share Bar & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Share Indicator */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
            <span>POOL SHARE</span>
            <span>{share.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${details.progressColor} transition-all duration-500`}
              style={{ width: `${Math.min(share, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => openTransactionModal('Expense')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 border border-slate-200 text-xs transition-colors shadow-sm"
            title="Log Expense with this Payment Mode"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openTransactionModal('Transfer')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 border border-slate-200 text-xs transition-colors shadow-sm"
            title="Transfer from/to this Payment Mode"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
