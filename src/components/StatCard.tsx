'use client';

import React, { ReactNode } from 'react';
import { formatCurrency } from '../utils/constants';

interface StatCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
  action?: ReactNode;
  tag?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  icon,
  trend,
  variant = 'neutral',
  action,
  tag,
}) => {
  const variantStyles = {
    primary: {
      cardClass: 'bento-card hover:border-blue-300',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBox: 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm',
      textColor: 'text-blue-600',
      accentGlow: 'from-blue-500/10 via-blue-500/5 to-transparent',
    },
    success: {
      cardClass: 'bento-card hover:border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm',
      textColor: 'text-emerald-600',
      accentGlow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    },
    danger: {
      cardClass: 'bento-card hover:border-rose-300',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBox: 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm',
      textColor: 'text-rose-600',
      accentGlow: 'from-rose-500/10 via-rose-500/5 to-transparent',
    },
    warning: {
      cardClass: 'bento-card hover:border-amber-300',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBox: 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm',
      textColor: 'text-amber-600',
      accentGlow: 'from-amber-500/10 via-amber-500/5 to-transparent',
    },
    neutral: {
      cardClass: 'bento-card hover:border-slate-300',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBox: 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm',
      textColor: 'text-slate-900',
      accentGlow: 'from-slate-200/40 via-transparent to-transparent',
    },
  }[variant];

  return (
    <div className={`${variantStyles.cardClass} p-6 relative overflow-hidden group flex flex-col justify-between`}>
      {/* Top Background Glow */}
      <div
        className={`absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-bl ${variantStyles.accentGlow} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="typo-label text-[11px] text-slate-500 tracking-wider">
              {title}
            </span>
            {tag && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {tag}
              </span>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${variantStyles.iconBox}`}>
            {icon}
          </div>
        </div>

        {/* Large Bold Typography Value */}
        <div className="space-y-1">
          <div className="typo-num text-3xl sm:text-4xl text-slate-900 tracking-tight leading-none">
            {formatCurrency(amount)}
          </div>
        </div>
      </div>

      {/* Card Footer info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {subtitle && (
          <p className="text-xs text-slate-500 truncate font-medium">{subtitle}</p>
        )}

        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {action && <div className="mt-3 pt-3 border-t border-slate-100">{action}</div>}
    </div>
  );
};
