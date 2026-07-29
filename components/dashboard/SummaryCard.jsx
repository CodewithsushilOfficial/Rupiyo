"use client";

import * as React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const THEME_CLASSES = {
  balance: {
    iconBg: 'bg-primary-soft',
    iconText: 'text-primary',
    stroke: 'var(--primary)',
  },
  income: {
    iconBg: 'bg-income-soft',
    iconText: 'text-income',
    stroke: 'var(--income)',
  },
  expense: {
    iconBg: 'bg-expense-soft',
    iconText: 'text-expense',
    stroke: 'var(--expense)',
  },
  savings: {
    iconBg: 'bg-savings-soft',
    iconText: 'text-savings',
    stroke: 'var(--savings)',
  },
};

export function SummaryCard({
  label,
  amount,
  change,
  isPositive,
  icon: Icon,
  sparkData = [],
  colorTheme = 'balance',
}) {
  const t = THEME_CLASSES[colorTheme] || THEME_CLASSES.balance;

  return (
    <div className="relative overflow-hidden rounded-card bg-card text-card-foreground border border-border shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {label}
            </p>
            <h3 className="mt-1.5 text-[22px] font-bold tracking-tight text-heading">
              {formatCurrency(amount)}
            </h3>
          </div>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.iconBg)}>
            <Icon className={cn('h-5 w-5', t.iconText)} />
          </div>
        </div>

        {/* Trend badge */}
        <div className="mt-2 flex items-center gap-1.5 text-[12px]">
          {isPositive ? (
            <ArrowUp className="h-3 w-3 text-income" />
          ) : (
            <ArrowDown className="h-3 w-3 text-expense" />
          )}
          <span className={cn('font-semibold', isPositive ? 'text-income' : 'text-expense')}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">from last month</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-12.5 w-full px-1">
        {sparkData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${colorTheme}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.stroke} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={t.stroke} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={t.stroke}
                strokeWidth={2}
                fill={`url(#spark-${colorTheme})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-end justify-center">
            <div className="w-full h-px bg-border" />
          </div>
        )}
      </div>
    </div>
  );
}
