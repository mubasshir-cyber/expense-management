'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useExpense } from '../context/ExpenseContext';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus,
  RefreshCw,
  Settings,
  Sheet,
  Menu,
  X,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const {
    isConnected,
    isSyncing,
    refreshData,
    openTransactionModal,
    openSettingsModal,
    toast,
  } = useExpense();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Expenses', href: '/expense', icon: TrendingDown },
    { name: 'Credits', href: '/credit', icon: TrendingUp },
    { name: 'Balance & Cards', href: '/balance', icon: Wallet },
  ];

  return (
    <>
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in max-w-md">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold font-mono tracking-tight backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-rose-500/10'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-amber-500/10'
                : 'bg-blue-50 text-blue-900 border-blue-300 shadow-blue-500/10'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            {toast.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Bright Bento Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-sm">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 sm:gap-8">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md sm:shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all duration-300 border border-blue-400/30 shrink-0">
                  <span className="text-white font-black text-base sm:text-xl tracking-wider font-mono">SBI</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="typo-hero font-extrabold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-blue-600 transition-colors">
                      EXPENSE OS
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      BENTO BRIGHT
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono tracking-tight">Google Sheets Synced</p>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Tools for Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Sheet Connection Status Pill */}
              <button
                onClick={openSettingsModal}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-sm shadow-emerald-500/10'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-sm shadow-amber-500/10'
                }`}
                title="Google Apps Script connection settings"
              >
                <Sheet className="w-3.5 h-3.5" />
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isConnected ? 'SHEETS LIVE' : 'CONNECT DB'}</span>
              </button>

              {/* Refresh / Sync Button */}
              <button
                onClick={refreshData}
                disabled={isSyncing}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all disabled:opacity-50"
                title="Sync latest data from Google Sheet"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              {/* Settings Button */}
              <button
                onClick={openSettingsModal}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Quick Add Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95 typo-label"
                >
                  <Plus className="w-4 h-4" />
                  <span>NEW TRANSACTION</span>
                </button>

                {isAddMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl p-1.5 z-50 animate-fade-in"
                    onMouseLeave={() => setIsAddMenuOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        openTransactionModal('Expense');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Log Expense</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        openTransactionModal('Credit');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Add Credit / Income</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        openTransactionModal('Transfer');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Transfer Funds</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Header Quick Actions */}
            <div className="flex items-center gap-1.5 sm:hidden">
              {/* Sync Pill */}
              <button
                onClick={refreshData}
                disabled={isSyncing}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors active:scale-95"
                title="Sync Google Sheet"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              {/* Sheet Connection Pill */}
              <button
                onClick={openSettingsModal}
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-[11px] font-mono font-bold transition-all active:scale-95 ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title="Settings & Sheet Connection"
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <Sheet className="w-3.5 h-3.5" />
              </button>

              {/* Settings button */}
              <button
                onClick={openSettingsModal}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};
