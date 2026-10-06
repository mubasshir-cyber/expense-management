'use client';

import React, { useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { StatCard } from '../../components/StatCard';
import { PaymentModeCard } from '../../components/PaymentModeCard';
import { TransactionTable } from '../../components/TransactionTable';
import { formatCurrency } from '../../utils/constants';
import {
  Wallet,
  ArrowRightLeft,
  Building2,
  CreditCard,
  Plus,
  ShieldCheck,
  Smartphone,
  Banknote,
  CreditCard as PaymentIcon,
  Scale,
  Pencil,
  Trash2
} from 'lucide-react';

export default function BalancePage() {
  const {
    accounts,
    transactions,
    openTransactionModal,
    openAccountModal,
    deleteAccount
  } = useExpense();

  // Calculate detailed stats per account / payment mode
  const accountStats = useMemo(() => {
    return accounts.map((acc) => {
      let credits = 0;
      let debits = 0;
      let count = 0;

      transactions.forEach((tx) => {
        if (tx.account === acc.name) {
          count++;
          if (tx.type === 'Credit') credits += tx.amount;
          if (tx.type === 'Expense') debits += tx.amount;
        }
      });

      const currentBalance = (acc.initialBalance || 0) + credits - debits;

      return {
        ...acc,
        currentBalance,
        totalCredits: credits,
        totalDebits: debits,
        transactionCount: count,
      };
    });
  }, [accounts, transactions]);

  // Total Liquid Assets (Bank + Cash + Wallet)
  const totalAssets = useMemo(() => {
    return accountStats
      .filter((a) => a.type !== 'Credit Card')
      .reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  }, [accountStats]);

  // Total Credit Card Outstanding / Debt
  const totalDebt = useMemo(() => {
    return accountStats
      .filter((a) => a.type === 'Credit Card')
      .reduce((sum, a) => sum + Math.abs(Math.min(0, a.currentBalance || 0)), 0);
  }, [accountStats]);

  const netWorth = totalAssets - totalDebt;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header Banner Bento */}
      <div className="bento-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono uppercase tracking-wider shadow-sm">
            <Scale className="w-3.5 h-3.5" />
            <span>LIQUIDITY &amp; PAYMENT MODES</span>
          </div>
          <h1 className="typo-hero text-3xl sm:text-4xl text-slate-900 tracking-tight">
            MODES OF PAYMENT &amp; BALANCES
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
            Manage your payment channels, track available liquidity, and reconcile account balances.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => openAccountModal()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95 typo-label shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Mode</span>
          </button>

          <button
            type="button"
            onClick={() => openTransactionModal('Transfer')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 typo-label shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>Transfer Funds</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Calculated Net Worth"
          tag="NET"
          amount={netWorth}
          subtitle="Total Liquid Assets minus Card Debt"
          icon={<ShieldCheck className="w-5 h-5" />}
          variant="primary"
        />

        <StatCard
          title="Liquid Capital &amp; Cash"
          tag="ASSETS"
          amount={totalAssets}
          subtitle="SBI Savings, UPI &amp; Physical Cash"
          icon={<Building2 className="w-5 h-5" />}
          variant="success"
        />

        <StatCard
          title="Card Dues / Liabilities"
          tag="DEBT"
          amount={totalDebt}
          subtitle="Outstanding credit card balances"
          icon={<CreditCard className="w-5 h-5" />}
          variant="danger"
        />
      </div>

      {/* MODES OF PAYMENT SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PaymentIcon className="w-4 h-4 text-blue-600" />
            <h2 className="typo-label text-sm text-slate-800">MODES OF PAYMENT</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500">{accounts.length} ACTIVE MODES</span>
            <button
              type="button"
              onClick={() => openAccountModal()}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono uppercase bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Mode</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accountStats.map((acc) => (
            <PaymentModeCard key={acc.name} account={acc} totalBalance={totalAssets} />
          ))}

          {/* New Mode Add Card */}
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

      {/* Payment Modes Reconciliation Ledger Bento Table */}
      <div className="bento-card overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="typo-label text-xs text-slate-800">PAYMENT MODES AUDIT &amp; RECONCILIATION</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Initial Baseline + Total Inflow - Total Outflow = Current Available Balance
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAccountModal()}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors uppercase"
          >
            + New Channel
          </button>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Opening Balance</th>
                <th className="py-3 px-4 text-right">Inflow (+)</th>
                <th className="py-3 px-4 text-right">Outflow (-)</th>
                <th className="py-3 px-4 text-right">Available Balance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {accountStats.map((acc) => (
                <tr key={acc.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                        {acc.type === 'Bank' && <Building2 className="w-4 h-4 text-blue-600" />}
                        {acc.type === 'Credit Card' && <CreditCard className="w-4 h-4 text-rose-600" />}
                        {acc.type === 'Wallet' && <Smartphone className="w-4 h-4 text-emerald-600" />}
                        {acc.type === 'Cash' && <Banknote className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{acc.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{acc.accountNumber || 'Primary'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                    {formatCurrency(acc.initialBalance || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 font-mono font-bold">
                    +{formatCurrency(acc.totalCredits)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-rose-600 font-mono font-bold">
                    -{formatCurrency(acc.totalDebits)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="typo-num text-sm font-bold text-slate-900">
                      {formatCurrency(acc.currentBalance)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openAccountModal(acc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                        title="Edit Mode"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete payment mode "${acc.name}"?`)) {
                            deleteAccount(acc.name);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                        title="Delete Mode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Transactions Ledger */}
      <div className="space-y-3">
        <TransactionTable
          initialTypeFilter="All"
          title="Payment Channel Activity Log"
        />
      </div>
    </div>
  );
}
