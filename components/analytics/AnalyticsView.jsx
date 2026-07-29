"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { CashFlowChart } from '@/components/analytics/CashFlowChart';
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

export function AnalyticsView({ analyticsData = {}, currentMonths = 6 }) {
  const router = useRouter();
  const [months, setMonths] = React.useState(currentMonths);

  const handlePeriodChange = (numMonths) => {
    setMonths(numMonths);
    router.push(`/analytics?months=${numMonths}`);
  };

  const { monthlyTrends = [], categoryBreakdown = [], summary = {} } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Financial Analytics & Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Cash flow trends, category expenditure distribution, and savings performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => handlePeriodChange(m)}
              className={cn(
                'rounded-control px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                months === m
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metric Cards */}
      <AnalyticsSummary summary={summary} />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cash Flow Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-heading">Income vs Expense Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={monthlyTrends} />
          </CardContent>
        </Card>

        {/* Category Expense Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-heading">Expense Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryBreakdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
