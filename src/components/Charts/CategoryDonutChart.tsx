'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategorySummary } from '../../types';
import { formatCurrency } from '../../utils/constants';

interface CategoryDonutChartProps {
  data: CategorySummary[];
  title?: string;
}

interface TooltipPayloadItem {
  value: number;
  payload: {
    category: string;
    percentage: number;
    color: string;
  };
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span>{data.payload.category}</span>
        </div>
        <p className="text-slate-700 font-bold font-mono">{formatCurrency(data.value)}</p>
        <p className="text-slate-500 text-[11px] font-medium">{data.payload.percentage.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full flex items-center justify-center text-xs text-slate-400">Loading breakdown...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
        <p className="text-sm font-medium">No category data</p>
        <p className="text-xs text-slate-500">Transactions will appear categorized here</p>
      </div>
    );
  }

  const topCategories = data.slice(0, 5);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
      {/* Chart */}
      <div className="sm:col-span-6 h-56 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomPieTooltip />} />
            <Pie
              data={topCategories}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
            >
              {topCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={3} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="sm:col-span-6 space-y-3">
        {topCategories.map((item) => (
          <div key={item.category} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700 font-bold truncate max-w-[140px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.category}</span>
              </span>
              <span className="font-bold text-slate-900 font-mono">{formatCurrency(item.amount)}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(item.percentage, 100)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
