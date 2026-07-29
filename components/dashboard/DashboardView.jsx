"use client";

import * as React from 'react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { ExpenseOverviewCard } from '@/components/dashboard/ExpenseOverviewCard';
import { RecentTransactionsCard } from '@/components/dashboard/RecentTransactionsCard';
import { MonthlyTrendCard } from '@/components/dashboard/MonthlyTrendCard';
import { TopCategoriesCard } from '@/components/dashboard/TopCategoriesCard';
import { WalletCards, ArrowDownToLine, ArrowUpFromLine, PiggyBank } from 'lucide-react';

export function DashboardView({ dashboardData = {}, user = {} }) {
  const {
    summary = {},
    expenseOverview = {},
    recentTransactions = [],
    monthlyTrend = [],
    topCategories = [],
  } = dashboardData;

  const userName = user.full_name || 'User';
  const userFirstName = userName.split(' ')[0] || '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 bg-background text-foreground min-h-screen">
      {/* ═══════ Welcome Greeting Banner in Page Content ═══════ */}
      <div className="pb-1 border-b border-border/40 md:border-none">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-heading">
          Welcome back{userFirstName ? `, ${userFirstName}` : ''}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your finances today.
        </p>
      </div>

      {/* ═══════ KPI Summary Cards (4 columns) ═══════ */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Balance"
          amount={summary.totalBalance}
          change={summary.balanceChange}
          isPositive={summary.balanceChange >= 0}
          icon={WalletCards}
          sparkData={summary.balanceTrend}
          colorTheme="balance"
        />
        <SummaryCard
          label="Total Income"
          amount={summary.totalIncome}
          change={summary.incomeChange}
          isPositive={summary.incomeChange >= 0}
          icon={ArrowDownToLine}
          sparkData={summary.incomeTrend}
          colorTheme="income"
        />
        <SummaryCard
          label="Total Expenses"
          amount={summary.totalExpenses}
          change={summary.expenseChange}
          isPositive={false}
          icon={ArrowUpFromLine}
          sparkData={summary.expenseTrend}
          colorTheme="expense"
        />
        <SummaryCard
          label="Savings This Month"
          amount={summary.monthlySavings}
          change={summary.savingsChange}
          isPositive={summary.savingsChange >= 0}
          icon={PiggyBank}
          sparkData={summary.savingsTrend}
          colorTheme="savings"
        />
      </div>

      {/* ═══════ Row 2: Expense Overview (7) + Recent Transactions (5) ═══════ */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ExpenseOverviewCard expenseOverview={expenseOverview} />
        </div>
        <div className="lg:col-span-5">
          <RecentTransactionsCard transactions={recentTransactions} />
        </div>
      </div>

      {/* ═══════ Row 3: Monthly Trend (7) + Top Categories (5) ═══════ */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MonthlyTrendCard trendData={monthlyTrend} />
        </div>
        <div className="lg:col-span-5">
          <TopCategoriesCard categories={topCategories} />
        </div>
      </div>
    </div>
  );
}
