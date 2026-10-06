'use client';

import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { StatCard } from '../../components/StatCard';
import { CategoryDonutChart } from '../../components/Charts/CategoryDonutChart';
import { TransactionTable } from '../../components/TransactionTable';
import { TrendingUp, Plus, Briefcase, Landmark, Coins } from 'lucide-react';

export default function CreditPage() {
  const {
    totalCredit,
    creditCategoriesSummary,
    transactions,
    openTransactionModal,
  } = useExpense();

  const creditTx = transactions.filter((t) => t.type === 'Credit');
  const avgCredit = creditTx.length > 0 ? totalCredit / creditTx.length : 0;
  const topSource = creditCategoriesSummary.length > 0 ? creditCategoriesSummary[0] : null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header Banner Bento */}
      <div className="bento-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono uppercase tracking-wider shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>CREDIT &amp; INFLOW MANAGEMENT</span>
          </div>
          <h1 className="typo-hero text-3xl sm:text-4xl text-slate-900 tracking-tight">
            INCOME &amp; REVENUE TRACKER
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
            Log salaries, client milestones, dividends, and cashbacks with automatic account allocation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openTransactionModal('Credit')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-95 typo-label shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Credit Entry</span>
        </button>
      </div>

      {/* Credit KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Credit Inflow"
          tag="REVENUE"
          amount={totalCredit}
          subtitle={`From ${creditTx.length} credited deposits`}
          icon={<Coins className="w-5 h-5" />}
          variant="success"
          trend={{
            value: `+${creditTx.length} deposits`,
            isPositive: true,
          }}
        />

        <StatCard
          title="Average Inflow Size"
          tag="MEAN"
          amount={avgCredit}
          subtitle="Mean deposit amount per credit transaction"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="primary"
        />

        <StatCard
          title="Primary Inflow Stream"
          tag="PRIMARY"
          amount={topSource ? topSource.amount : 0}
          subtitle={topSource ? `${topSource.category} (${topSource.percentage.toFixed(1)}%)` : 'No credits recorded'}
          icon={<Briefcase className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Income Sources Allocation Bento Card */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="typo-label text-xs text-slate-800">INFLOW STREAMS DISTRIBUTION</h3>
            <p className="text-xs text-slate-500 mt-0.5">Proportional breakdown of earnings, salary, and returns</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            {creditCategoriesSummary.length} REVENUE SOURCES
          </span>
        </div>

        <CategoryDonutChart data={creditCategoriesSummary} />
      </div>

      {/* Detailed Credit Ledger */}
      <div className="space-y-3">
        <TransactionTable
          initialTypeFilter="Credit"
          title="Filtered Credit Ledger"
        />
      </div>
    </div>
  );
}
