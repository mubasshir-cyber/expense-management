'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useExpense } from '../context/ExpenseContext';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Wallet,
  Plus
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { openTransactionModal } = useExpense();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Expenses', href: '/expense', icon: TrendingDown },
    { name: 'Credits', href: '/credit', icon: TrendingUp },
    { name: 'Balances', href: '/balance', icon: Wallet },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      {/* Floating Bottom Bar Container */}
      <div className="px-3 pb-3 pointer-events-auto">
        <nav className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-900/15 flex items-center justify-around py-2 px-2 relative">
          
          {/* Dashboard */}
          {(() => {
            const item = navItems[0];
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
              </Link>
            );
          })()}

          {/* Expenses */}
          {(() => {
            const item = navItems[1];
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
                  isActive
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-rose-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
              </Link>
            );
          })()}

          {/* Center Quick Add Action Button */}
          <div className="flex flex-col items-center justify-center -mt-6 px-1">
            <button
              type="button"
              onClick={() => openTransactionModal('Expense')}
              className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all border-2 border-white flex items-center justify-center"
              aria-label="Add Transaction"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-1 font-mono">
              Add
            </span>
          </div>

          {/* Credits */}
          {(() => {
            const item = navItems[2];
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
                  isActive
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
              </Link>
            );
          })()}

          {/* Balances */}
          {(() => {
            const item = navItems[3];
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all ${
                  isActive
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
              </Link>
            );
          })()}

        </nav>
      </div>
    </div>
  );
};
