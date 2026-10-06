'use client';

import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { EXPENSE_CATEGORIES, CREDIT_CATEGORIES, getTodayDateStr } from '../utils/constants';
import { X, TrendingDown, TrendingUp, ArrowRightLeft, Calendar, Tag, CreditCard, FileText } from 'lucide-react';

export const TransactionModal = () => {
  const {
    isTransactionModalOpen,
    modalTransactionType,
    closeTransactionModal,
    addTransaction,
    transferMoney,
    accounts,
  } = useExpense();

  const [activeType, setActiveType] = useState<'Expense' | 'Credit' | 'Transfer'>('Expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateStr());
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isTransactionModalOpen) {
      setActiveType(modalTransactionType);
      setAmount('');
      setDate(getTodayDateStr());
      setNote('');

      if (accounts.length > 0) {
        setAccount(accounts[0].name);
        if (accounts.length > 1) {
          setToAccount(accounts[1].name);
        }
      }

      if (modalTransactionType === 'Expense') {
        setCategory(EXPENSE_CATEGORIES[0].name);
      } else if (modalTransactionType === 'Credit') {
        setCategory(CREDIT_CATEGORIES[0].name);
      } else {
        setCategory('Transfer');
      }
    }
  }, [isTransactionModalOpen, modalTransactionType, accounts]);

  const handleTypeChange = (type: 'Expense' | 'Credit' | 'Transfer') => {
    setActiveType(type);
    if (type === 'Expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else if (type === 'Credit') {
      setCategory(CREDIT_CATEGORIES[0].name);
    } else {
      setCategory('Transfer');
    }
  };

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeType === 'Transfer') {
        if (account === toAccount) {
          alert('Source and destination accounts must be different');
          setIsSubmitting(false);
          return;
        }
        await transferMoney(account, toAccount, numAmount, note, date);
      } else {
        await addTransaction({
          amount: numAmount,
          category: category || (activeType === 'Expense' ? 'Other Expense' : 'Other Income'),
          account: account || (accounts[0]?.name ?? 'SBI Savings Account'),
          date: date || getTodayDateStr(),
          type: activeType,
          note: note.trim(),
        });
      }
      closeTransactionModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTransactionModalOpen) return null;

  const currentCategories = activeType === 'Expense' ? EXPENSE_CATEGORIES : CREDIT_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 typo-label">
            {activeType === 'Expense' && <TrendingDown className="w-5 h-5 text-rose-600" />}
            {activeType === 'Credit' && <TrendingUp className="w-5 h-5 text-emerald-600" />}
            {activeType === 'Transfer' && <ArrowRightLeft className="w-5 h-5 text-blue-600" />}
            <span>Add {activeType === 'Transfer' ? 'Account Transfer' : activeType}</span>
          </h3>
          <button
            onClick={closeTransactionModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 m-5 mb-2 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleTypeChange('Expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'Expense'
                ? 'bg-white text-rose-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('Credit')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'Credit'
                ? 'bg-white text-emerald-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Credit / Income</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('Transfer')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'Transfer'
                ? 'bg-white text-blue-700 border border-slate-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>Transfer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 typo-label">
              Amount (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all typo-num"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[100, 500, 1000, 2000, 5000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors ml-auto"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* If Transfer, show Source & Destination Accounts */}
          {activeType === 'Transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 typo-label">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>From Account</span>
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.name} value={acc.name}>
                      {acc.name} (₹{acc.currentBalance?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 typo-label">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>To Account</span>
                </label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.name} value={acc.name}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Otherwise, show Category & Account Select */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 typo-label">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {currentCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 typo-label">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Account Channel</span>
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.name} value={acc.name}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date and Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 typo-label">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 typo-label">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Description / Note</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Supermarket, Salary, Petrol"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeTransactionModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 typo-label ${
                activeType === 'Expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  : activeType === 'Credit'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
              }`}
            >
              {isSubmitting ? 'Saving...' : `Save ${activeType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
