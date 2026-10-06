'use client';

import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { StatCard } from '../components/StatCard';
import { PaymentModeCard } from '../components/PaymentModeCard';
import { CashFlowChart } from '../components/Charts/CashFlowChart';
import { CategoryDonutChart } from '../components/Charts/CategoryDonutChart';
import { TransactionTable } from '../components/TransactionTable';
import { formatCurrency } from '../utils/constants';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  Plus,
  ArrowRightLeft,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Receipt,
  CreditCard,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    totalCredit,
    totalExpense,
    netBalance,
    monthlySummaries,
    expenseCategoriesSummary,
    accounts,
    transactions,
    openTransactionModal,
    openSettingsModal,
    openAccountModal,
    isConnected,
  } = useExpense();

  const savingsRate = totalCredit > 0 ? Math.max(0, ((totalCredit - totalExpense) / totalCredit) * 100) : 0;
  const expenseCount = transactions.filter((t) => t.type === 'Expense').length;
  const creditCount = transactions.filter((t) => t.type === 'Credit').length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* ========================================================================= */}
      {/* BENTO ROW 1: Hero Control Center & Highlight Net Balance                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Main Hero Bento Card (Col span 8) */}
        <div className="lg:col-span-8 bento-card p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-slate-200">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Top Pill / Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>SBI Financial OS</span>
              </span>

              <span
                onClick={openSettingsModal}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border transition-all shadow-sm ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isConnected ? 'Sheets Live' : 'Connect Sheet'}</span>
              </span>
            </div>

            {/* Bold Headline */}
            <h1 className="typo-hero text-2xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight sm:leading-none mb-2 sm:mb-3">
              INTELLIGENT EXPENSE <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600">
                &amp; CASH FLOW LEDGER
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium leading-relaxed">
              Real-time multi-account tracking, automated category allocation, and bidirectional Google Sheets cloud sync.
            </p>
          </div>

          {/* Action Dock */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => openTransactionModal('Expense')}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95 typo-label text-center"
            >
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span>Log Expense</span>
            </button>

            <button
              type="button"
              onClick={() => openTransactionModal('Credit')}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 typo-label text-center"
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Add Credit</span>
            </button>

            <button
              type="button"
              onClick={() => openTransactionModal('Transfer')}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 typo-label text-center"
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Transfer Funds</span>
            </button>

            <button
              type="button"
              onClick={openSettingsModal}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-colors ml-auto hidden sm:flex"
              title="Database Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlight Net Balance Bento Card (Col span 4) */}
        <div className="lg:col-span-4 bento-card-glow-blue p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="typo-label text-[11px] sm:text-xs text-blue-100">TOTAL NET BALANCE</span>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/20 text-white border border-white/30 backdrop-blur-md">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="typo-num text-3xl sm:text-5xl text-white tracking-tight leading-none">
              {formatCurrency(netBalance)}
            </div>

            <p className="text-[11px] sm:text-xs text-blue-100/80 mt-2 font-medium">
              Net position across {accounts.length} active payment channels
            </p>
          </div>

          <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/20 space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-100/90 font-medium">Total Inflow</span>
              <span className="typo-num font-bold text-emerald-300">+{formatCurrency(totalCredit)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-100/90 font-medium">Total Outflow</span>
              <span className="typo-num font-bold text-rose-300">-{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO ROW 2: Key Financial Metric Cards                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Credit Inflow"
          tag="INCOME"
          amount={totalCredit}
          subtitle={`${creditCount} incoming credits recorded`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
          trend={{
            value: `+${creditCount} deposits`,
            isPositive: true,
          }}
        />

        <StatCard
          title="Total Outflow"
          tag="EXPENSE"
          amount={totalExpense}
          subtitle={`${expenseCount} debits logged`}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="danger"
          trend={{
            value: `-${expenseCount} expenses`,
            isPositive: false,
          }}
        />

        <StatCard
          title="Savings Efficiency"
          tag="RATIO"
          amount={savingsRate}
          subtitle="Net savings divided by income"
          icon={<Percent className="w-5 h-5" />}
          variant="warning"
          trend={{
            value: `${savingsRate.toFixed(1)}% Saved`,
            isPositive: savingsRate >= 20,
          }}
        />

        <StatCard
          title="Payment Channels"
          tag="MODES"
          amount={accounts.length}
          subtitle="UPI, Bank, Card & Cash"
          icon={<CreditCard className="w-5 h-5" />}
          variant="neutral"
          action={
            <Link
              href="/balance"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center justify-between group"
            >
              <span>Manage Modes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          }
        />
      </div>

      {/* ========================================================================= */}
      {/* BENTO ROW 3: Modes of Payment Grid                                       */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h2 className="typo-label text-sm text-slate-800">MODES OF PAYMENT</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAccountModal()}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono uppercase bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Mode</span>
            </button>
            <Link
              href="/balance"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 font-mono uppercase"
            >
              <span>Full Balances</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => (
            <PaymentModeCard key={acc.name} account={acc} totalBalance={netBalance} />
          ))}

          {/* Add Mode Action Card */}
          <button
            type="button"
            onClick={() => openAccountModal()}
            className="bento-card p-6 border-dashed border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 flex flex-col items-center justify-center text-center gap-2 transition-all group min-h-[190px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="typo-label text-xs text-slate-800 font-bold group-hover:text-blue-600 transition-colors">
                + Add Payment Mode
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New Bank, UPI, Card or Cash
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO ROW 4: Visual Analytics (Cashflow + Category Breakdown)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Cashflow Visualizer (Col span 7) */}
        <div className="lg:col-span-7 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="typo-label text-xs text-slate-800">MONTHLY CASH FLOW VELOCITY</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Inflow vs Outflow comparison across billing cycles</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                INCOME
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                EXPENSE
              </span>
            </div>
          </div>
          <CashFlowChart data={monthlySummaries} />
        </div>

        {/* Top Spending Categories (Col span 5) */}
        <div className="lg:col-span-5 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <h3 className="typo-label text-xs text-slate-800">CATEGORY ALLOCATION</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Proportional spending distribution</p>
            </div>
            <Link
              href="/expense"
              className="text-xs text-blue-600 hover:text-blue-700 font-mono font-bold"
            >
              DETAILS &rarr;
            </Link>
          </div>
          <CategoryDonutChart data={expenseCategoriesSummary} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO ROW 5: Real-Time Transaction Ledger                                */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h2 className="typo-label text-sm text-slate-800">REAL-TIME ACTIVITY LEDGER</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <Link href="/expense" className="text-rose-600 hover:text-rose-700">
              EXPENSES &rarr;
            </Link>
            <Link href="/credit" className="text-emerald-600 hover:text-emerald-700">
              CREDITS &rarr;
            </Link>
          </div>
        </div>

        <TransactionTable limit={8} />
      </div>
    </div>
  );
}
