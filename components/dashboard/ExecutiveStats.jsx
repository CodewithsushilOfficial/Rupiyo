"use client";

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export function ExecutiveStats({ summary = {} }) {
  const netWorth = Number(summary.netWorth || 0);
  const monthlyIncome = Number(summary.monthlyIncome || 0);
  const monthlyExpense = Number(summary.monthlyExpense || 0);
  const netSavings = Number(summary.netSavings || 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Net Worth */}
      <Card className="border-l-4 border-l-blue-600 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Net Worth
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Across {summary.accountCount || 0} active accounts
          </p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Income
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +₹{monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Current calendar month</p>
        </CardContent>
      </Card>

      {/* Monthly Expense */}
      <Card className="border-l-4 border-l-red-500 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Expenses
            </span>
            <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            -₹{monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Current calendar month</p>
        </CardContent>
      </Card>

      {/* Net Savings */}
      <Card className="border-l-4 border-l-purple-500 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Savings Cash Flow
            </span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            ₹{netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Surplus retained</p>
        </CardContent>
      </Card>
    </div>
  );
}
