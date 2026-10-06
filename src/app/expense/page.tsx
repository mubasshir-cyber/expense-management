'use client';

import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { StatCard } from '../../components/StatCard';
import { CategoryDonutChart } from '../../components/Charts/CategoryDonutChart';
import { TransactionTable } from '../../components/TransactionTable';
import { TrendingDown, Plus, ShoppingBag, Receipt, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';

export default function ExpensePage() {
  const {
    totalExpense,
    expenseCategoriesSummary,
    transactions,
    openTransactionModal,
  } = useExpense();

  const expenseTx = transactions.filter((t) => t.type === 'Expense');
  const avgExpense = expenseTx.length > 0 ? totalExpense / expenseTx.length : 0;
  const topCategory = expenseCategoriesSummary.length > 0 ? expenseCategoriesSummary[0] : null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header Banner Bento */}
      <div className="bento-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-rose-50/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold font-mono uppercase tracking-wider shadow-sm">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>DEBIT &amp; EXPENDITURE AUDIT</span>
          </div>
          <h1 className="typo-hero text-3xl sm:text-4xl text-slate-900 tracking-tight">
            EXPENSE CONTROL CENTER
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
            Monitor granular outflows, pinpoint high-spending categories, and maintain strict budget discipline.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openTransactionModal('Expense')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-sm font-bold shadow-lg shadow-rose-600/25 transition-all active:scale-95 typo-label shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Expense Entry</span>
        </button>
      </div>

      {/* Expense KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Outflow"
          tag="EXPENSES"
          amount={totalExpense}
          subtitle={`Across ${expenseTx.length} categorized entries`}
          icon={<Receipt className="w-5 h-5" />}
          variant="danger"
          trend={{
            value: `${expenseTx.length} items`,
            isPositive: false,
          }}
        />

        <StatCard
          title="Average Ticket Size"
          tag="MEAN"
          amount={avgExpense}
          subtitle="Mean expenditure per transaction"
          icon={<TrendingDown className="w-5 h-5" />}
          variant="warning"
        />

        <StatCard
          title="Top Expense Channel"
          tag="PEAK"
          amount={topCategory ? topCategory.amount : 0}
          subtitle={topCategory ? `${topCategory.category} (${topCategory.percentage.toFixed(1)}%)` : 'No expenses logged'}
          icon={<ShoppingBag className="w-5 h-5" />}
          variant="primary"
        />
      </div>

      {/* Category Allocation Bento Card */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="typo-label text-xs text-slate-800">CATEGORY SPENDING BREAKDOWN</h3>
            <p className="text-xs text-slate-500 mt-0.5">Visual distribution across active expenditure categories</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 uppercase">
            {expenseCategoriesSummary.length} CATEGORIES
          </span>
        </div>

        <CategoryDonutChart data={expenseCategoriesSummary} />
      </div>

      {/* Detailed Expense Ledger */}
      <div className="space-y-3">
        <TransactionTable
          initialTypeFilter="Expense"
          title="Filtered Expense Ledger"
        />
      </div>
    </div>
  );
}
