'use client';

import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Account } from '../types';
import {
  X,
  Building2,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  Tag,
  Hash
} from 'lucide-react';

export const AccountModal = () => {
  const {
    isAccountModalOpen,
    editingAccount,
    closeAccountModal,
    addAccount,
    updateAccount,
  } = useExpense();

  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('Bank');
  const [initialBalance, setInitialBalance] = useState('0');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAccountModalOpen) {
      if (editingAccount) {
        setName(editingAccount.name);
        setType(editingAccount.type);
        setInitialBalance(String(editingAccount.initialBalance ?? 0));
        setAccountNumber(editingAccount.accountNumber || '');
      } else {
        setName('');
        setType('Bank');
        setInitialBalance('0');
        setAccountNumber('');
      }
    }
  }, [isAccountModalOpen, editingAccount]);

  if (!isAccountModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name for the payment mode');
      return;
    }

    setIsSubmitting(true);
    try {
      const balanceNum = parseFloat(initialBalance) || 0;
      const accountData: Account = {
        name: name.trim(),
        type: type,
        initialBalance: balanceNum,
        accountNumber: accountNumber.trim() || undefined,
      };

      if (editingAccount) {
        await updateAccount(editingAccount.name, accountData);
      } else {
        await addAccount(accountData);
      }
      closeAccountModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypes: Array<{
    type: Account['type'];
    label: string;
    icon: typeof Building2;
    color: string;
  }> = [
    { type: 'Bank', label: 'Bank Account', icon: Building2, color: 'text-blue-600' },
    { type: 'Wallet', label: 'UPI / Wallet', icon: Smartphone, color: 'text-emerald-600' },
    { type: 'Credit Card', label: 'Credit Card', icon: CreditCard, color: 'text-rose-600' },
    { type: 'Cash', label: 'Cash in Hand', icon: Banknote, color: 'text-amber-600' },
    { type: 'Investment', label: 'Investment', icon: TrendingUp, color: 'text-indigo-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 typo-label">
                {editingAccount ? 'Edit Payment Mode' : 'Create New Payment Mode'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {editingAccount ? 'Update channel details & balance' : 'Add a new bank, wallet, card, or cash pool'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAccountModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Payment Mode Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 typo-label">
              Payment Channel Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {accountTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setType(item.type)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 typo-label flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Payment Mode Name *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SBI Savings Account, Paytm UPI, Amazon Pay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Opening / Initial Balance & Identifier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 typo-label">
                Opening Balance (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 typo-label flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Masked No. / UPI ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g. •••• 3821, upi@sbi"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeAccountModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors uppercase font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-50 typo-label"
            >
              {isSubmitting
                ? 'Saving...'
                : editingAccount
                ? 'Save Changes'
                : 'Create Mode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
