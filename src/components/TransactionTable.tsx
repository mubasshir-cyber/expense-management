'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(limit || 10);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, categoryFilter, accountFilter, sortBy, sortOrder, pageSize]);

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

  // Filter & sort all matching transactions
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

    return list;
  }, [transactions, typeFilter, categoryFilter, accountFilter, searchTerm, sortBy, sortOrder]);

  // Total pages calculation
  const totalEntries = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));

  // Current paginated items
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

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

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  return (
    <div className="bento-card overflow-hidden">
      {/* Table Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="typo-label text-sm text-slate-800">{title}</h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 border border-slate-300">
              {totalEntries} ENTRIES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Google Sheets synced double-entry records
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {totalEntries > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 border border-slate-200 shadow-sm transition-colors uppercase"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
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

      {/* Filter Bar */}
      {!hideFilters && (
        <div className="p-3 sm:p-4 border-b border-slate-200/80 bg-slate-50/80 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category, note, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Filter Selects Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Type Filter */}
            {initialTypeFilter === 'All' && (
              <div className="relative col-span-2 sm:col-span-1">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'All')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="All">All Types (Credit &amp; Debit)</option>
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
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
        </div>
      )}

      {/* Content Area */}
      <div>
        {totalEntries === 0 ? (
          <div className="py-12 sm:py-16 px-4 text-center">
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
              className="mt-4 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors uppercase font-mono shadow-md shadow-blue-600/20"
            >
              Add First Transaction
            </button>
          </div>
        ) : (
          <>
            {/* 1. Mobile Feed View (visible on < md screens) */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedTransactions.map((t) => {
                const isExpense = t.type === 'Expense';
                return (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    {/* Left: Icon & Description */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                          isExpense
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {isExpense ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm truncate">{t.category}</p>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {t.account}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium truncate">
                          <span>{formatDate(t.date)}</span>
                          {t.note && (
                            <>
                              <span>•</span>
                              <span className="truncate text-slate-600">{t.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Delete Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span
                          className={`typo-num text-sm sm:text-base font-bold ${
                            isExpense ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.note || t.category)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 active:bg-rose-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View (visible on >= md screens) */}
            <div className="hidden md:block overflow-x-auto">
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
                  {paginatedTransactions.map((t) => {
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
            </div>

            {/* Pagination Controls */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Entries count and Page Size Selector */}
              <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                <span>
                  Showing <strong className="text-slate-900 font-mono">{totalEntries > 0 ? startIndex : 0}</strong> to{' '}
                  <strong className="text-slate-900 font-mono">{endIndex}</strong> of{' '}
                  <strong className="text-slate-900 font-mono">{totalEntries}</strong>
                </span>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="hidden sm:inline">|</span>
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Prev Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Chips */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, and pages around current page
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;
                      const isCurrent = page === currentPage;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-slate-400 text-xs font-mono">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
