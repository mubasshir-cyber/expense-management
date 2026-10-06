'use client';

import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/constants';
import { useExpense } from '../context/ExpenseContext';
import {
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Download,
  Filter,
  ArrowUpDown,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

interface TransactionTableProps {
  initialTypeFilter?: TransactionType | 'All';
  title?: string;
  limit?: number;
  hideFilters?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  initialTypeFilter = 'All',
  title = 'Recent Activity Ledger',
  limit,
  hideFilters = false,
}) => {
  const { transactions, deleteTransaction, openTransactionModal, accounts } = useExpense();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'All'>(initialTypeFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [accountFilter, setAccountFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Extract unique categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (typeFilter === 'All' || t.type === typeFilter) {
        set.add(t.category);
      }
    });
    return Array.from(set).sort();
  }, [transactions, typeFilter]);

  // Filter & sort transactions
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (typeFilter !== 'All') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'All') {
      list = list.filter((t) => t.category === categoryFilter);
    }

    if (accountFilter !== 'All') {
      list = list.filter((t) => t.account === accountFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.account.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    if (limit) {
      return list.slice(0, limit);
    }

    return list;
  }, [transactions, typeFilter, categoryFilter, accountFilter, searchTerm, sortBy, sortOrder, limit]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Category', 'Account', 'Amount', 'Note', 'CreatedAt'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.account.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      t.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SBI_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string, note?: string) => {
    if (window.confirm(`Delete transaction${note ? ` "${note}"` : ''}?`)) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="bento-card overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="typo-label text-sm text-slate-800">{title}</h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 border border-slate-300">
              {filteredTransactions.length} ENTRIES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Google Sheets synced double-entry records
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {filteredTransactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 border border-slate-200 shadow-sm transition-colors uppercase"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => openTransactionModal(initialTypeFilter === 'Expense' ? 'Expense' : initialTypeFilter === 'Credit' ? 'Credit' : 'Expense')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all typo-label"
          >
            <span>+ ADD TRANSACTION</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (if not hidden) */}
      {!hideFilters && (
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category, note, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Type Filter */}
          {initialTypeFilter === 'All' && (
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'All')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                <option value="All">All Types (Credit & Expense)</option>
                <option value="Expense">Expenses Only</option>
                <option value="Credit">Credits Only</option>
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            >
              <option value="All">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div className="relative">
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            >
              <option value="All">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.name} value={acc.name}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="typo-label text-xs text-slate-700">No Transactions Recorded</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || categoryFilter !== 'All' || accountFilter !== 'All'
                ? 'Try resetting your active filters to see all entries.'
                : 'Get started by creating your first entry.'}
            </p>
            <button
              onClick={() => openTransactionModal(initialTypeFilter === 'Expense' ? 'Expense' : initialTypeFilter === 'Credit' ? 'Credit' : 'Expense')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors uppercase font-mono shadow-md shadow-blue-600/20"
            >
              Add First Transaction
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="py-3.5 px-5">
                  <button
                    onClick={() => {
                      if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('date');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-5">Category &amp; Note</th>
                <th className="py-3.5 px-5">Account Channel</th>
                <th className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => {
                      if (sortBy === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('amount');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 ml-auto hover:text-slate-900"
                  >
                    <span>Amount (INR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-5 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredTransactions.map((t) => {
                const isExpense = t.type === 'Expense';
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    {/* Date */}
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-600 font-mono">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(t.date)}</span>
                      </div>
                    </td>

                    {/* Category & Note */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isExpense
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}
                        >
                          {isExpense ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{t.category}</p>
                          {t.note && <p className="text-[11px] text-slate-500 truncate max-w-sm">{t.note}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px] font-semibold">
                        {t.account}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span
                        className={`typo-num text-sm sm:text-base ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(t.amount)}
                      </span>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.note || t.category)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-60 group-hover:opacity-100"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
