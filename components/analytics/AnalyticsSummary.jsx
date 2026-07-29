"use client";

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export function AnalyticsSummary({ summary = {} }) {
  const totalIncome = Number(summary.totalIncome || 0);
  const totalExpense = Number(summary.totalExpense || 0);
  const netSavings = Number(summary.netSavings || 0);
  const savingsRate = Number(summary.savingsRate || 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Income */}
      <Card className="border-l-4 border-l-income">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Total Period Income
            </span>
            <div className="rounded-control bg-income-soft p-2 text-income">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-xl font-bold text-heading">
            {formatCurrency(totalIncome)}
          </h3>
        </CardContent>
      </Card>

      {/* Total Expense */}
      <Card className="border-l-4 border-l-expense">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Total Period Expenses
            </span>
            <div className="rounded-control bg-expense-soft p-2 text-expense">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-xl font-bold text-heading">
            {formatCurrency(totalExpense)}
          </h3>
        </CardContent>
      </Card>

      {/* Net Savings */}
      <Card className="border-l-4 border-l-savings">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Net Savings Cash Flow
            </span>
            <div className="rounded-control bg-savings-soft p-2 text-savings">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-xl font-bold text-heading">
            {formatCurrency(netSavings)}
          </h3>
        </CardContent>
      </Card>

      {/* Savings Rate % */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Savings Rate
            </span>
            <div className="rounded-control bg-primary-soft p-2 text-primary">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-xl font-bold text-heading">
            {savingsRate}%
          </h3>
        </CardContent>
      </Card>
    </div>
  );
}
