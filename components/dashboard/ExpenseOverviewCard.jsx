"use client";

import * as React from 'react';
import Link from 'next/link';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { ChevronDown, ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Custom Tooltip defined outside render to avoid recreation
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-control bg-popover text-popover-foreground border border-border shadow-dropdown px-3 py-2 text-[12px]">
        <p className="font-semibold text-heading">{payload[0].name}</p>
        <p className="font-bold text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

/**
 * Expense Overview card with donut chart + category legend.
 * ALL data from props.expenseOverview — zero hardcoded values.
 */
import { useIsClient } from '@/lib/hooks/useIsClient';

export function ExpenseOverviewCard({ expenseOverview = {} }) {
  const mounted = useIsClient();

  const { total = 0, changePercent = 0, categories = [] } = expenseOverview;

  const chartData = categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color || 'var(--primary)',
  }));

  return (
    <div className="rounded-card bg-card text-card-foreground border border-border shadow-card h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h3 className="text-[17px] font-bold text-heading">
          Expense Overview
        </h3>
        <button className="flex items-center gap-1.5 rounded-sm border border-input bg-card hover:bg-muted text-muted-foreground px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors">
          This Month
          <ChevronDown className="h-3.5 w-3.5 text-subtle" />
        </button>
      </div>

      <div className="px-6 pb-5">
        {categories.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4 bg-primary-soft text-primary">
              <ArrowDown className="h-6 w-6" />
            </div>
            <p className="text-[15px] font-semibold mb-1 text-foreground">
              No expenses this month
            </p>
            <p className="text-[12px] max-w-60 text-muted-foreground">
              Your expense breakdown will appear here after you add an expense.
            </p>
          </div>
        ) : (
          /* ── DATA STATE ── */
          <>
            {/* Total + Change */}
            <div className="mb-1">
              <h2 className="text-[24px] font-bold tracking-tight text-heading">
                {formatCurrency(total)}
              </h2>
              {changePercent !== 0 && (
                <div className="flex items-center gap-1 mt-1 text-[12px]">
                  <ArrowDown className={cn('h-3 w-3', changePercent < 0 ? 'text-income' : 'text-expense')} />
                  <span className={cn('font-semibold', changePercent < 0 ? 'text-income' : 'text-expense')}>
                    {Math.abs(changePercent).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              )}
            </div>

            {/* Donut + Legend Grid */}
            <div className="grid grid-cols-12 items-center gap-4 mt-4">
              {/* Donut */}
              <div className="relative col-span-5 flex items-center justify-center h-50">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={88}
                        paddingAngle={3}
                        dataKey="value"
                        cornerRadius={4}
                        stroke="none"
                      >
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-full border-4 border-dashed border-border" />
                )}
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[18px] font-bold text-heading">
                    {formatCurrency(total)}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Total Expenses
                  </span>
                </div>
              </div>

              {/* Category Legend */}
              <div className="col-span-7 space-y-2.5">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || 'var(--primary)' }}
                      />
                      <span className="font-medium text-foreground">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-heading">
                        {formatCurrency(cat.amount, true)}
                      </span>
                      <span className="w-10 text-right font-medium text-muted-foreground">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* View full report link */}
            <div className="mt-5 pt-3 border-t border-border-subtle">
              <Link
                href="/reports"
                className="group flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                View full report
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
