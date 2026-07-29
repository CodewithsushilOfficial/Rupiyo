"use client";

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/formatters';
import { ChevronDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-control bg-popover text-popover-foreground border border-border shadow-dropdown p-3.5 text-[12px] min-w-42.5">
        <p className="font-bold mb-2 pb-1.5 border-b border-border-subtle text-heading">
          {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-income shrink-0" />
              Income:
            </span>
            <span className="font-bold text-heading">
              {formatCurrency(payload[0]?.value)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-expense shrink-0" />
              Expenses:
            </span>
            <span className="font-bold text-heading">
              {formatCurrency(payload[1]?.value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

import { useIsClient } from '@/lib/hooks/useIsClient';

export function MonthlyTrendCard({ trendData = [] }) {
  const mounted = useIsClient();

  return (
    <div className="rounded-card bg-card text-card-foreground border border-border shadow-card h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h3 className="text-[17px] font-bold text-heading">
          Monthly Trend
        </h3>
        <button className="flex items-center gap-1.5 rounded-sm border border-input bg-card hover:bg-muted text-muted-foreground px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors">
          This Year
          <ChevronDown className="h-3.5 w-3.5 text-subtle" />
        </button>
      </div>

      <div className="px-6 pb-5">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-4 text-[12px] font-medium">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-3 w-3 rounded-[3px] bg-income" />
            Income
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-3 w-3 rounded-[3px] bg-expense" />
            Expenses
          </span>
        </div>

        {/* Chart */}
        <div className="h-60 w-full">
          {!mounted || trendData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[13px] text-muted-foreground">
              {mounted ? 'No trend data available.' : 'Loading chart...'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--primary-soft)' }} />
                <Bar dataKey="income" name="Income" fill="var(--income)" radius={[5, 5, 0, 0]} barSize={18} />
                <Bar dataKey="expenses" name="Expenses" fill="var(--expense)" radius={[5, 5, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
