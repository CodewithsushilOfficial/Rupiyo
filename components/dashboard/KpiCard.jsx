"use client";

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * KPI Summary Card with Recharts sparkline.
 * colorTheme: 'balance' | 'income' | 'expense' | 'savings'
 */
import { useIsClient } from '@/lib/hooks/useIsClient';

export function KpiCard({ title, amount, percentage, isPositive, icon: Icon, colorTheme }) {
  const mounted = useIsClient();

  const themeMap = {
    balance: {
      iconBg: '#EEECFF', iconColor: '#6759E8',
      stroke: '#6759E8', fillOpacity: 0.08, trendColor: '#22B573',
    },
    income: {
      iconBg: '#EAF9F1', iconColor: '#22B573',
      stroke: '#22B573', fillOpacity: 0.08, trendColor: '#22B573',
    },
    expense: {
      iconBg: '#FFF0F3', iconColor: '#F05B78',
      stroke: '#F05B78', fillOpacity: 0.08, trendColor: '#F05B78',
    },
    savings: {
      iconBg: '#EDF4FF', iconColor: '#548AF7',
      stroke: '#548AF7', fillOpacity: 0.08, trendColor: '#22B573',
    },
  };

  const t = themeMap[colorTheme] || themeMap.balance;

  const sparklineData = [
    { v: 38 }, { v: 22 }, { v: 58 }, { v: 32 }, { v: 68 }, { v: 48 }, { v: 85 }
  ];

  return (
    <div
      className="relative overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E8E8F0',
        boxShadow: '0 1px 2px rgba(20,20,40,0.02), 0 4px 14px rgba(20,20,40,0.035)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,30,60,0.07)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(20,20,40,0.02), 0 4px 14px rgba(20,20,40,0.035)'; }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9292A3' }}>
              {title}
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight" style={{ color: '#202033' }}>
              {formatCurrency(amount)}
            </h3>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
              <span
                className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{
                  backgroundColor: isPositive ? '#EAF9F1' : '#FFF0F3',
                  color: isPositive ? '#188A57' : '#D94763',
                }}
              >
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {formatPercentage(Math.abs(percentage))}
              </span>
              <span style={{ color: '#9292A3' }} className="font-medium">vs last month</span>
            </div>
          </div>

          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: t.iconBg, color: t.iconColor }}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-5 h-10 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`kpi-grad-${colorTheme}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.stroke} stopOpacity={t.fillOpacity} />
                    <stop offset="100%" stopColor={t.stroke} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={t.stroke}
                  strokeWidth={2.5}
                  fill={`url(#kpi-grad-${colorTheme})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50 dark:bg-slate-900 rounded" />
          )}
        </div>
      </div>
    </div>
  );
}
