"use client";

import * as React from 'react';
import Link from 'next/link';
import { ExecutiveStats } from '@/components/dashboard/ExecutiveStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  ArrowRight,
  Sparkles,
  PieChart,
  Download,
  Receipt,
  Target,
} from 'lucide-react';
import * as Icons from 'lucide-react';

export function ExecutiveDashboardView({ summaryData = {} }) {
  const { summary = {}, recentTransactions = [], budgets = [], goals = [] } = summaryData;

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Financial Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time financial telemetry, cash flow balance, and active goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/transactions">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </Link>
          <Link href="/insights">
            <Button size="sm" variant="outline" className="gap-2 border-purple-300 text-purple-700 dark:border-purple-800 dark:text-purple-300">
              <Sparkles className="h-4 w-4 text-purple-600" /> AI Insights
            </Button>
          </Link>
          <Link href="/reports">
            <Button size="sm" variant="ghost" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <ExecutiveStats summary={summary} />

      {/* Grid Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity Ledger (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" /> Recent Transactions
            </CardTitle>
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              View Full Ledger <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent transactions recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((t) => {
                  const IconComponent = Icons[t.category?.icon_name] || Icons.Tag;
                  const isIncome = t.type === 'INCOME';
                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
                          style={{ backgroundColor: t.category?.color_hex || '#64748B' }}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {t.description || t.category?.name || 'Transaction'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t.transaction_date} • {t.account?.name}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}₹{Number(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Panel Widgets (1 col) */}
        <div className="space-y-6">
          {/* Active Budgets Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-600" /> Active Budgets
              </CardTitle>
              <Link href="/budgets" className="text-xs text-blue-600 hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgets.length === 0 ? (
                <p className="text-xs text-slate-400">No active monthly budgets configured.</p>
              ) : (
                budgets.slice(0, 3).map((b) => (
                  <div key={b.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{b.category?.name || 'Overall Budget'}</span>
                      <span>{b.percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          b.percentage >= 100 ? 'bg-red-500' : b.percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Goals Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" /> Savings Goals
              </CardTitle>
              <Link href="/goals" className="text-xs text-blue-600 hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-400">No savings goals created.</p>
              ) : (
                goals.map((g) => {
                  const pct = Math.min(100, Math.round((Number(g.current_amount || 0) / Number(g.target_amount || 1)) * 100));
                  return (
                    <div key={g.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{g.title}</span>
                        <span className="text-purple-600 dark:text-purple-400">{pct}%</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        ₹{Number(g.current_amount || 0).toLocaleString('en-IN')} of ₹{Number(g.target_amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
